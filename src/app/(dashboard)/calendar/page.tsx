'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, Users, Video, Calendar, ChevronRight, Home } from 'lucide-react'
import { PageHeader, PageHeaderPresets } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CalendarClient from './calendar-client'

export default function CalendarPage() {
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
                <span className="text-[#111828] font-medium">Calendar</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Calendar
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View all upcoming scheduled calls and training sessions. Click on any event to add it to your google calendar.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Main Calendar Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <CalendarClient />
        </div>
      </section>
    </div>
  )
}
