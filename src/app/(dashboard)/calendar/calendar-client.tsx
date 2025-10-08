'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, RefreshCw } from 'lucide-react'
import GoogleCalendar from './google-calendar'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
  hasVirtualMeeting: boolean
}

export default function CalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[Calendar Client] Fetching events...')
      const response = await fetch('/api/calendar/events')
      
      if (!response.ok) {
        const data = await response.json()
        console.log('[Calendar Client] Error response:', data)
        throw new Error(data.error || data.message || 'Failed to fetch events')
      }

      const data = await response.json()
      console.log('[Calendar Client] Received events:', data)
      setEvents(data.events || [])
    } catch (err: any) {
      console.error('[Calendar Client] Error fetching events:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#176FFF]" />
      </div>
    )
  }

  if (error) {
    // Check if it's specifically an API key error
    const needsApiKey = error.includes('API key') || error.includes('Calendar requires API key')
    
    if (needsApiKey) {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-orange-900 mb-2">Setup Required</h3>
              <p className="text-orange-800 mb-4">To display calendar events, you need to add a Google API key.</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>Select your project (or create one)</li>
                <li>Go to APIs & Services → Credentials</li>
                <li>Create an API Key</li>
                <li>Add to your .env file: <code className="bg-orange-100 px-1 rounded">GOOGLE_API_KEY=your-key</code></li>
                <li>Enable the Google Calendar API for your project</li>
              </ol>
              <div className="mt-4 p-3 bg-orange-100 rounded">
                <p className="text-xs text-orange-700">Calendar ID: {process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'Not configured'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // Other errors
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-red-900 mb-2">Error Loading Calendar</h3>
            <p className="text-red-800 mb-4">{error}</p>
            <Button onClick={fetchEvents} variant="outline" size="sm">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the Google Calendar component
  return <GoogleCalendar events={events} loading={loading} onRefresh={fetchEvents} />
}
