'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, Loader2, Home, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { FormattedMessage } from '@/components/formatted-message'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-[#111828] hover:opacity-80 transition-opacity"
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-2 text-[#111828]" />
                <span className="text-[#111828] font-medium">Ask Ricky AI</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ask Ricky AI
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered coaching assistant available 24/7
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <Card className="max-w-4xl mx-auto card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--brand)]">
                <Bot className="h-6 w-6 text-[var(--ink-inverse)]" />
              </div>
              <CardTitle className="text-xl text-[var(--ink-inverse)]">
                AI Coaching Assistant
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea 
              ref={scrollAreaRef}
              className="h-[500px] w-full rounded-md border border-white/10 bg-black/20 p-4 mb-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-[var(--ink-inverse)]/60 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ask me anything about real estate, sales, or success strategies!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-[var(--brand)] text-white'
                            : 'bg-white/10 text-[var(--ink-inverse)]'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <FormattedMessage content={message.content} className="text-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-inverse)]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-white/10 border-white/20 text-[var(--ink-inverse)] placeholder:text-[var(--ink-inverse)]/50"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
