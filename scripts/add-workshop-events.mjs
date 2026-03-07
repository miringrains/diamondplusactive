#!/usr/bin/env node

/**
 * One-time script to add the "Never Make Another Cold Call Again"
 * workshop events to the Google Calendar.
 *
 * Usage:  node scripts/add-workshop-events.mjs
 *
 * Opens a browser for Google OAuth, then creates the 3 events.
 * VS Code remote SSH auto-forwards the port so localhost works.
 */

import { google } from 'googleapis'
import http from 'http'
import { URL } from 'url'
import 'dotenv/config'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const PORT = 3456

if (!CLIENT_ID || !CLIENT_SECRET || !CALENDAR_ID) {
  console.error('Missing env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALENDAR_ID')
  process.exit(1)
}

const REDIRECT_URI = `http://localhost:${PORT}/callback`

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const ZOOM_LINK = 'https://us02web.zoom.us/j/84578777331?pwd=Bzafk5iBbkrFdrUtqpp2Pwmq0AKWso.1'
const FB_GROUP = 'https://www.facebook.com/groups/4267238183550978'

const EVENTS = [
  {
    summary: 'Never Make Another Cold Call Again - Day 1',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 1 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    location: ZOOM_LINK,
    start: { dateTime: '2026-03-09T13:00:00-05:00', timeZone: 'America/New_York' },
    end:   { dateTime: '2026-03-09T15:00:00-05:00', timeZone: 'America/New_York' },
  },
  {
    summary: 'Never Make Another Cold Call Again - Day 2',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 2 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    location: ZOOM_LINK,
    start: { dateTime: '2026-03-10T13:00:00-05:00', timeZone: 'America/New_York' },
    end:   { dateTime: '2026-03-10T15:00:00-05:00', timeZone: 'America/New_York' },
  },
  {
    summary: 'Never Make Another Cold Call Again - Day 3',
    description: `3-Day Live Workshop: Never Make Another Cold Call Again\n\nDay 3 of 3\n\nZoom Meeting Link: ${ZOOM_LINK}\n\nFacebook Group: ${FB_GROUP}\nJoin the private workshop group for discussions and resources.`,
    location: ZOOM_LINK,
    start: { dateTime: '2026-03-11T13:00:00-05:00', timeZone: 'America/New_York' },
    end:   { dateTime: '2026-03-11T15:00:00-05:00', timeZone: 'America/New_York' },
  },
]

async function createEvents(code) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  console.log('\nCreating 3 workshop events...\n')

  for (const event of EVENTS) {
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    })
    console.log(`  Created: ${event.summary}  (id: ${res.data.id})`)
  }

  console.log('\nAll 3 workshop events added to the calendar.')
  console.log('They will appear automatically on the portal calendar page.\n')
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`<h1>Authorization denied</h1><p>${error}</p>`)
      console.error('Authorization denied:', error)
      process.exit(1)
    }

    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<h1>Authorization successful!</h1><p>Creating workshop events... check your terminal.</p><script>window.close()</script>')

      try {
        await createEvents(code)
      } catch (err) {
        console.error('Error creating events:', err.message)
      }

      server.close()
      process.exit(0)
    }
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  })

  console.log('\n=== Add Workshop Events to Google Calendar ===\n')
  console.log('Open this URL in your browser to authorize:\n')
  console.log(authUrl)
  console.log(`\nWaiting for authorization on http://localhost:${PORT}/callback ...\n`)
  console.log('(If VS Code prompts to open a port, click "Open in Browser")\n')
})
