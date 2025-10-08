# Video Upload Infrastructure Map

## Overview
The Diamond District platform supports large video uploads (up to 5GB) with streaming capabilities, progress tracking, and dual storage options (local filesystem or AWS S3).

## System Components

### 1. Frontend Components

#### Upload Manager (`/src/lib/upload-manager.ts`)
- **Purpose**: Client-side upload orchestration
- **Features**:
  - Progress tracking
  - Background uploads
  - Pause/resume capability
  - LocalStorage persistence
  - Axios-based HTTP requests
- **Flow**:
  1. Creates FormData with file
  2. Sends to `/api/upload/stream` endpoint
  3. Tracks progress via Axios onUploadProgress
  4. Handles success/failure callbacks

#### Lesson Upload Form (`/src/components/admin/lesson-upload-form.tsx`)
- **Purpose**: UI for video upload in admin panel
- **Features**:
  - File selection
  - Progress bar
  - Upload status display
  - Integration with Upload Manager

### 2. Backend API Endpoints

#### Streaming Upload (`/api/upload/stream/route.ts`)
- **Purpose**: Handle large file uploads without memory crashes
- **Key Features**:
  - Uses formidable for multipart parsing
  - Streams directly to disk
  - Generates unique filenames with UUID
  - Video validation
  - Thumbnail generation
  - S3 upload (if configured)
- **Process Flow**:
  1. Auth check (ADMIN only)
  2. Create temp directories
  3. Parse multipart form with formidable
  4. Stream file to temp location
  5. Rename file with proper extension
  6. Validate video
  7. Generate thumbnail
  8. Upload to S3 or move to public folder
  9. Return URLs

#### Legacy Upload (`/api/upload/route.ts`)
- **Purpose**: Original upload endpoint (memory-intensive)
- **Status**: Still exists but not recommended for large files

#### Video Serving (`/api/videos/[filename]/route.ts`)
- **Purpose**: Serve video content with auth
- **Features**:
  - Authentication check
  - Range request support
  - S3 signed URL generation
  - Local file streaming

### 3. Storage Layer

#### Local Storage
- **Temp Directory**: `/uploads/temp/` - Temporary storage during upload
- **Final Directory**: `/public/videos/` - Public video storage
- **Thumbnails**: `/public/thumbnails/` - Generated thumbnails

#### AWS S3 Storage
- **Service**: `/src/lib/s3.ts`
- **Features**:
  - Standard upload (< 100MB)
  - Multipart upload (> 100MB)
  - Signed URL generation
  - CloudFront CDN support
- **Configuration**: Via environment variables

### 4. Video Processing

#### Video Processor (`/src/lib/video-processor.ts`)
- **Purpose**: Validate and process videos
- **Features**:
  - Video validation (codec, duration, resolution)
  - Thumbnail generation with ffmpeg
  - Metadata extraction

### 5. Infrastructure Configuration

#### PM2 Process Manager
- **Config**: `ecosystem.config.js`
- **Memory Limit**: 2GB (`max_memory_restart`)
- **Node Options**: `--max-old-space-size=2048`

#### Nginx Reverse Proxy
- **Client Max Body Size**: 5GB
- **Timeout**: 30 minutes
- **Proxy Buffer Size**: Optimized for large uploads

## Issue Analysis & Resolution

### Error: ENOENT during rename operation
```
ENOENT: no such file or directory, rename 
'/root/project/diamond-district/uploads/temp/ef01498c-c2e1-4c00-9edf-4ca6d8421029.mp4' -> 
'/root/project/diamond-district/uploads/temp/ef01498c-c2e1-4c00-9edf-4ca6d8421029.mp4'
```

### Root Cause:
1. Formidable was configured with `keepExtensions: true` and a custom `filename` function that adds the extension
2. The code then tried to rename the file to add an extension that was already present
3. Attempting to rename a file to itself caused the ENOENT error

### Additional Issue Found:
- Conflict between `filename` function (adding proper extension) and `fileWriteStreamHandler` (creating .tmp file)

### Resolution:
1. **Removed redundant rename operation** - File already has correct extension from formidable
2. **Removed fileWriteStreamHandler** - Let formidable handle file writing with proper naming
3. **Used path.basename()** to get the actual filename from formidable

### Verification Results:
- ✅ Upload directories exist and have proper permissions
- ✅ S3 connection tested successfully (0 objects in bucket)
- ✅ No leftover temp files causing conflicts

## Key Takeaways

### Best Practices:
1. **Don't mix formidable's automatic features with manual overrides**
   - Either use `keepExtensions` OR handle extensions manually, not both
   - Either use formidable's default file handling OR custom stream handlers, not both

2. **Always log actual file paths during upload**
   - Helps identify naming conflicts quickly
   - Essential for debugging file operations

3. **Test each component independently**
   - S3 connection test script proved S3 wasn't the issue
   - Directory checks confirmed permissions weren't the problem

### Upload Flow (Corrected):
1. Client sends multipart form data to `/api/upload/stream`
2. Formidable parses and saves file with UUID + extension
3. Video validation runs on the saved file
4. Thumbnail generation creates preview image
5. File uploaded to S3 (if configured) or moved to public folder
6. URLs returned to client