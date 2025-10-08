import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/supabase/auth-server'
import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_PROJECT = process.env.OPENAI_PROJECT

export async function POST(request: NextRequest) {
  try {
    // Optional: Check for session but don't require it
    const session = await auth()
    
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json({ 
        reply: "I'm sorry, but the AI service is not properly configured. Please contact support." 
      })
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      // Only add project header for project-specific keys
      ...(OPENAI_PROJECT && OPENAI_API_KEY?.startsWith('sk-proj-') && {
        defaultHeaders: {
          'OpenAI-Project': OPENAI_PROJECT
        }
      })
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are Ricky Carruth, #1 RE/MAX agent worldwide (700+ homes/year). Direct but supportive coach from Mobile, Alabama.

CORE: "20 contacts before 11am" - Share what worked for YOU, not assumptions about them.

STYLE: Start with "Listen..." or "Here's the deal..." Share YOUR experience and what YOU learned. End with "Give it a try and let me know how it goes."

KEY PHRASES: "What worked for me was..." | "In my experience..." | "When I was building my business..."

Always: 1) ASK about their situation first 2) Share what worked for you 3) Offer specific strategies 4) Encourage action without being pushy.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7, // Balanced for Ricky's direct yet dynamic style
      max_tokens: 500, // Keep responses punchy and actionable like Ricky
    })

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Ask AI error:', error)
    
    // Check if it's an OpenAI API error
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.status, error.message)
      if (error.status === 401) {
        return NextResponse.json({ 
          reply: "Authentication error with AI service. Please check the API key configuration." 
        })
      }
      if (error.status === 429) {
        return NextResponse.json({ 
          reply: "The AI service is currently at capacity. This may be due to rate limits or quota exceeded. Please try again later or contact support." 
        })
      }
      if (error.status === 400) {
        return NextResponse.json({ 
          reply: "There was an issue with the request. Please try rephrasing your question." 
        })
      }
    }
    
    return NextResponse.json({ 
      reply: "I encountered an unexpected error. Please try again later." 
    })
  }
}
