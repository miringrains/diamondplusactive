import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/supabase/auth-server'

function generateICS(event: {
  title: string
  description?: string
  start: string
  end: string
  location?: string
  url?: string
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Diamond Plus//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@diamondplusportal.com`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  return icsContent
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { event } = await req.json()
    if (!event || !event.title || !event.start || !event.end) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    // Generate ICS content
    const icsContent = generateICS({
      ...event,
      // Add portal URL instead of actual meeting link
      url: 'https://diamondplusportal.com/calendar',
      description: `${event.description || ''}\n\nJoin this event at: https://diamondplusportal.com/calendar\n\nNote: Active Diamond Plus membership required to access meeting links.`
    })

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '-')}.ics"`,
      },
    })
  } catch (error: any) {
    console.error('[Add to Calendar] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate calendar file',
      details: error.message 
    }, { status: 500 })
  }
}
