import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { auth } from '@/lib/supabase/auth-server'

// Initialize Google Calendar API
const calendar = google.calendar('v3')

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_URL + '/api/calendar/callback'
)

// For now, we'll use API key for public calendar access
// Later we can implement full OAuth flow if needed
const API_KEY = process.env.GOOGLE_API_KEY

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      return NextResponse.json({ error: 'Calendar ID not configured' }, { status: 500 })
    }

    // Get query parameters for date range
    const searchParams = req.nextUrl.searchParams
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days

    // Fetch events from Google Calendar
    // Try without authentication first (for public calendars)
    let response
    try {
      // First attempt: no auth (works for fully public calendars)
      response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      })
    } catch (error: any) {
      // If that fails, we need an API key
      console.log('[Calendar Events] Public access failed, API key required:', error.message)
      
      if (!API_KEY) {
        // Return a helpful message about getting an API key
        return NextResponse.json({ 
          error: 'Calendar requires API key',
          message: 'This calendar requires authentication. Please add GOOGLE_API_KEY to your .env file.',
          setup: {
            steps: [
              '1. Go to https://console.cloud.google.com',
              '2. Select your project',
              '3. Enable Google Calendar API',
              '4. Create an API Key in Credentials',
              '5. Add to .env: GOOGLE_API_KEY=your-key'
            ]
          },
          calendarId // Include for debugging
        }, { status: 400 })
      }
      
      // Try with API key
      response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
        key: API_KEY,
      })
    }

    const events = response.data.items || []

    // Transform events to our format
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      // Don't expose meeting links directly - handle those separately
      hasVirtualMeeting: event.description?.includes('zoom') || event.location?.includes('zoom'),
    }))

    return NextResponse.json({ 
      events: transformedEvents,
      calendar: {
        title: response.data.summary,
        description: response.data.description,
      }
    })
  } catch (error: any) {
    console.error('[Calendar Events] Error:', error)
    
    // If it's an API key issue, return helpful message
    if (error.code === 403) {
      return NextResponse.json({ 
        error: 'Calendar API not configured. Please add GOOGLE_API_KEY to environment variables.',
        setup: 'Get API key from Google Cloud Console > APIs & Services > Credentials'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error.message 
    }, { status: 500 })
  }
}
