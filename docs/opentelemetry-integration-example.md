# OpenTelemetry Integration Example for Video Player

This example shows how to integrate OpenTelemetry into your existing video player to diagnose the issues mentioned in your audit.

## Updated Video Player Component

```typescript
// components/video-player.tsx with OpenTelemetry instrumentation

import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr-react';
import { VideoPlayerTelemetry } from '@/lib/telemetry/video-instrumentation';

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  initialTime?: number;
  onProgress?: (time: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ 
  url, 
  lessonId, 
  initialTime = 0, 
  onProgress, 
  onComplete 
}: VideoPlayerProps) {
  const playerRef = useRef<Plyr>(null);
  const telemetryRef = useRef<VideoPlayerTelemetry>();
  const [hasResumed, setHasResumed] = useState(false);
  
  // Initialize telemetry on mount
  useEffect(() => {
    const userId = 'current-user-id'; // Get from session
    telemetryRef.current = new VideoPlayerTelemetry(lessonId, userId, url);
    telemetryRef.current.startSession(initialTime);
    
    return () => {
      // Clean up telemetry on unmount
      telemetryRef.current?.endSession(
        playerRef.current?.plyr?.currentTime || 0,
        false
      );
    };
  }, [lessonId, url, initialTime]);
  
  const handleReady = async (player: Plyr) => {
    const telemetry = telemetryRef.current;
    if (!telemetry) return;
    
    telemetry.trackLoadStart();
    
    try {
      // CRITICAL FIX: Wait for metadata before seeking
      const plyrInstance = player.plyr;
      
      // Wait for metadata to be loaded
      if (plyrInstance.duration === 0) {
        await new Promise<void>((resolve) => {
          const checkMetadata = () => {
            if (plyrInstance.duration > 0) {
              plyrInstance.off('loadedmetadata', checkMetadata);
              resolve();
            }
          };
          plyrInstance.on('loadedmetadata', checkMetadata);
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(), 10000);
        });
      }
      
      telemetry.trackLoadComplete(plyrInstance.duration);
      
      // Now safe to resume
      if (initialTime > 0 && !hasResumed) {
        const seekStartTime = performance.now();
        const targetPosition = Math.min(initialTime, plyrInstance.duration - 1);
        
        plyrInstance.currentTime = targetPosition;
        
        // Verify seek worked
        setTimeout(() => {
          const actualPosition = plyrInstance.currentTime;
          const seekTime = performance.now() - seekStartTime;
          const success = Math.abs(actualPosition - targetPosition) < 1;
          
          telemetry.trackResumeAttempt(targetPosition, actualPosition, success);
          telemetry.trackSeek(0, actualPosition, seekTime);
          
          if (!success) {
            console.error(`Resume failed: target=${targetPosition}, actual=${actualPosition}`);
          }
          
          setHasResumed(true);
        }, 100);
      }
    } catch (error) {
      telemetry.trackError(error as Error, {
        context: 'video_ready_handler',
        initialTime,
      });
    }
  };
  
  // Track buffering events
  const handleWaiting = () => {
    telemetryRef.current?.trackBufferingStart();
  };
  
  const handlePlaying = () => {
    telemetryRef.current?.trackBufferingEnd();
  };
  
  // Track playback events
  const handlePlay = (event: Plyr.PlyrEvent) => {
    const position = event.detail.plyr.currentTime;
    telemetryRef.current?.trackPlay(position);
  };
  
  const handlePause = (event: Plyr.PlyrEvent) => {
    const position = event.detail.plyr.currentTime;
    telemetryRef.current?.trackPause(position);
  };
  
  // Track errors
  const handleError = (event: Plyr.PlyrEvent) => {
    const error = new Error('Video playback error');
    telemetryRef.current?.trackError(error, {
      url,
      currentTime: event.detail.plyr.currentTime,
    });
  };
  
  return (
    <Plyr
      ref={playerRef}
      source={{
        type: 'video',
        sources: [{ src: url }],
      }}
      options={{
        controls: ['play-large', 'play', 'progress', 'current-time', 
                  'mute', 'volume', 'captions', 'settings', 'pip', 
                  'airplay', 'fullscreen'],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      }}
      onReady={handleReady}
      onPlay={handlePlay}
      onPause={handlePause}
      onWaiting={handleWaiting}
      onPlaying={handlePlaying}
      onError={handleError}
      onTimeUpdate={(event) => {
        const time = event.detail.plyr.currentTime;
        onProgress?.(time);
      }}
      onEnded={() => {
        telemetryRef.current?.endSession(
          playerRef.current?.plyr?.duration || 0,
          true
        );
        onComplete?.();
      }}
    />
  );
}
```

## Updated Progress Tracking Hook

```typescript
// hooks/useProgressTracking.ts with OpenTelemetry

import { useCallback, useRef } from 'react';
import { ProgressTrackingTelemetry } from '@/lib/telemetry/video-instrumentation';
import throttle from 'lodash.throttle';

export function useProgressTracking(lessonId: string, userId: string) {
  const telemetryRef = useRef<ProgressTrackingTelemetry>();
  const lastSavedPosition = useRef<number>(0);
  
  // Initialize telemetry
  useEffect(() => {
    telemetryRef.current = new ProgressTrackingTelemetry(lessonId, userId);
    telemetryRef.current.startTracking();
    
    return () => {
      telemetryRef.current?.stopTracking();
    };
  }, [lessonId, userId]);
  
  const saveProgress = useCallback(async (position: number, duration: number) => {
    const telemetry = telemetryRef.current;
    if (!telemetry) return;
    
    try {
      await telemetry.trackProgressUpdate(position, async () => {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            positionSeconds: position,
            durationSeconds: duration,
            watchTime: position,
            completed: position > duration * 0.9,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Progress save failed: ${response.status}`);
        }
        
        return response.json();
      });
      
      lastSavedPosition.current = position;
    } catch (error) {
      console.error('Failed to save progress:', error);
      
      // Check for sync conflicts
      if (error instanceof Error && error.message.includes('conflict')) {
        telemetry.trackConflict(position, lastSavedPosition.current);
      }
    }
  }, [lessonId]);
  
  // Throttle progress updates to prevent double-tracking
  const throttledSaveProgress = useRef(
    throttle(saveProgress, 5000, { leading: true, trailing: true })
  ).current;
  
  // Save on visibility change (fixes missing persistence issue)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Force immediate save when page is hidden
        throttledSaveProgress.flush();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', () => throttledSaveProgress.flush());
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      throttledSaveProgress.cancel();
    };
  }, [throttledSaveProgress]);
  
  return {
    saveProgress: throttledSaveProgress,
    saveProgressImmediate: saveProgress,
  };
}
```

## Updated API Route with Tracing

```typescript
// app/api/progress/route.ts with OpenTelemetry

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { traceVideoOperation } from '@/lib/telemetry/video-instrumentation';
import { z } from 'zod';

const progressSchema = z.object({
  lessonId: z.string(),
  watchTime: z.number().min(0),
  positionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
  completed: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const data = progressSchema.parse(body);
    
    // Wrap database operation with tracing
    const result = await traceVideoOperation(
      'api.progress.save',
      {
        lesson_id: data.lessonId,
        user_id: session.user.id,
        position: data.positionSeconds,
        completed: data.completed,
      },
      async () => {
        // Check for existing progress to detect conflicts
        const existing = await prisma.progress.findUnique({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: data.lessonId,
            },
          },
        });
        
        // Upsert progress with conflict detection
        const progress = await prisma.progress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: data.lessonId,
            },
          },
          update: {
            watchTime: Math.max(data.watchTime, existing?.watchTime || 0),
            positionSeconds: data.positionSeconds,
            durationSeconds: data.durationSeconds,
            completed: data.completed || existing?.completed || false,
            lastWatched: new Date(),
          },
          create: {
            userId: session.user.id,
            lessonId: data.lessonId,
            watchTime: data.watchTime,
            positionSeconds: data.positionSeconds,
            durationSeconds: data.durationSeconds,
            completed: data.completed,
          },
        });
        
        return progress;
      }
    );
    
    return NextResponse.json({ success: true, progress: result });
  } catch (error) {
    console.error('[Progress API] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
```

## What This Instrumentation Reveals

With this setup, you'll be able to see:

1. **Resume Timing Issues**:
   - Exact timing between metadata load and seek attempt
   - Success/failure of resume attempts with position differences
   - Duration of the video when seek was attempted

2. **Double Progress Tracking**:
   - All progress API calls show as separate spans
   - Throttling behavior is visible
   - Duplicate calls are easy to spot in the trace

3. **Missing Persistence**:
   - Visibility change events trigger saves
   - Page hide events are captured
   - Final position on session end

4. **Race Conditions**:
   - Concurrent API calls show as overlapping spans
   - Database query timing reveals lock contention
   - Conflict detection shows position mismatches

5. **Performance Metrics**:
   - Video load times by lesson
   - Buffering frequency and duration
   - API response times
   - Database query performance

## Viewing the Data

Once configured, you can view:

1. **Traces** in Jaeger/Grafana:
   - Full request flow from video load to progress save
   - Timing of each operation
   - Errors with stack traces

2. **Metrics** in Grafana:
   - Video load time percentiles
   - Buffering event rates
   - Progress save success rates
   - Concurrent viewer counts

3. **Dashboards** showing:
   - Which videos cause the most buffering
   - Resume success rates by video
   - API performance by endpoint
   - User engagement patterns
