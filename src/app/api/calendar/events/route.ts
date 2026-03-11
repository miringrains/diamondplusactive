import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { auth } from '@/lib/supabase/auth-server'

export const dynamic = 'force-dynamic'

const calendar = google.calendar('v3')
const API_KEY = process.env.GOOGLE_API_KEY

// Portal-managed events — add events here directly, no Google Calendar write access needed.
// The "Add to Google Calendar" button on the frontend lets users save these to their personal calendars.
const ZOOM_LINK = 'https://us02web.zoom.us/j/84578777331?pwd=Bzafk5iBbkrFdrUtqpp2Pwmq0AKWso.1'
const FB_GROUP = 'https://www.facebook.com/groups/4267238183550978'

const portalEvents = [
  {
    id: 'workshop-cold-call-bonus',
    title: 'Never Make Another Cold Call Again - Bonus Session',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nBonus Session\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    start: '2026-03-08T13:00:00-04:00',
    end: '2026-03-08T15:00:00-04:00',
    location: ZOOM_LINK,
    hasVirtualMeeting: true,
  },
  {
    id: 'workshop-cold-call-day1',
    title: 'Never Make Another Cold Call Again - Day 1',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 1 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    start: '2026-03-09T13:00:00-04:00',
    end: '2026-03-09T15:00:00-04:00',
    location: ZOOM_LINK,
    hasVirtualMeeting: true,
  },
  {
    id: 'workshop-cold-call-day2',
    title: 'Never Make Another Cold Call Again - Day 2',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 2 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    start: '2026-03-10T13:00:00-04:00',
    end: '2026-03-10T15:00:00-04:00',
    location: ZOOM_LINK,
    hasVirtualMeeting: true,
  },
  {
    id: 'workshop-cold-call-day3',
    title: 'Never Make Another Cold Call Again - Day 3',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 3 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    start: '2026-03-11T13:00:00-04:00',
    end: '2026-03-11T15:00:00-04:00',
    location: ZOOM_LINK,
    hasVirtualMeeting: true,
  },
]

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID

    const searchParams = req.nextUrl.searchParams
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

    // Start with portal-managed events (filtered by date range)
    const minDate = new Date(timeMin).getTime()
    const maxDate = new Date(timeMax).getTime()
    const filteredPortalEvents = portalEvents.filter(event => {
      const eventTime = new Date(event.start).getTime()
      return eventTime >= minDate && eventTime <= maxDate
    })

    // Also fetch from Google Calendar if configured (for recurring coaching calls, etc.)
    let googleEvents: any[] = []
    if (calendarId) {
      try {
        let response
        try {
          response = await calendar.events.list({
            calendarId,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50,
          })
        } catch {
          if (API_KEY) {
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
        }

        if (response?.data?.items) {
          googleEvents = response.data.items.map(event => ({
            id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location,
            hasVirtualMeeting: event.description?.includes('zoom') || event.location?.includes('zoom'),
          }))
        }
      } catch (error: any) {
        console.error('[Calendar Events] Google Calendar fetch failed:', error.message)
      }
    }

    // Merge portal events + Google Calendar events, sorted by start time
    const allEvents = [...filteredPortalEvents, ...googleEvents]
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    return NextResponse.json({ events: allEvents })
  } catch (error: any) {
    console.error('[Calendar Events] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error.message 
    }, { status: 500 })
  }
}
