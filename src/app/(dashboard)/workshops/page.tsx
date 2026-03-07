'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Home, ChevronRight, Send, Clock, Users, Dumbbell, Hotel, Video, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function WorkshopsPage() {
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
                <span className="text-[#111828] font-medium">Workshops</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Workshops
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Intensive in-person workshops included with your Diamond+ membership
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        {/* Never Make Another Cold Call Again - 3 Day Virtual Workshop */}
        <Card className="bg-white shadow-sm border-gray-200 max-w-4xl mx-auto mb-12 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide animate-pulse">
              Live This Week
            </span>
          </div>
          <CardHeader>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Never Make Another Cold Call Again
              </h2>
              <p className="text-xl text-[#176FFF] font-semibold mb-2">
                March 9th, 10th &amp; 11th — 1:00 PM - 3:00 PM EST
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A 3-day live virtual workshop on hiring, training, and deploying Inside Sales Agents (ISAs) so you can stop cold calling for good.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 lg:px-8">

            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                This workshop is INCLUDED in your Diamond+ membership
              </p>
              <p className="text-gray-700">
                You have full access as a Diamond+ Coaching student — no additional purchase needed.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Schedule</h3>
              <div className="grid gap-3">
                {[
                  { day: 'Day 1', date: 'Monday, March 9th', time: '1:00 PM - 3:00 PM EST' },
                  { day: 'Day 2', date: 'Tuesday, March 10th', time: '1:00 PM - 3:00 PM EST' },
                  { day: 'Day 3', date: 'Wednesday, March 11th', time: '1:00 PM - 3:00 PM EST' },
                ].map((session) => (
                  <div key={session.day} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="bg-[#176FFF] text-white text-sm font-bold px-3 py-1.5 rounded">
                      {session.day}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.date}</p>
                      <p className="text-gray-600 text-sm">{session.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-gray-900">How to Join</h4>
              </div>
              <p className="text-gray-700">
                The Zoom link for each session is available on your{' '}
                <Link href="/calendar" className="text-[#176FFF] font-medium hover:underline">
                  Calendar
                </Link>
                . Click any workshop event to see the join link and add it to your personal calendar.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-[#176FFF]" />
                <h4 className="font-semibold text-gray-900">Workshop Facebook Group</h4>
              </div>
              <p className="text-gray-700 mb-4">
                Join the private Facebook group for workshop discussions, resources, and live interaction with other participants.
              </p>
              <Button className="bg-[#1877F2] hover:bg-[#166FE5] text-white" size="sm" asChild>
                <a
                  href="https://www.facebook.com/groups/4267238183550978"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join Facebook Group
                </a>
              </Button>
            </div>

            <div className="border-t pt-8 text-center">
              <Button
                className="bg-[#176FFF] hover:bg-[#1460E5] text-white px-8 py-6 text-lg font-semibold"
                asChild
              >
                <a
                  href="https://zerotodiamond.com/3day-workshop-page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Full Workshop Details
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listing Selling Secrets Workshop */}
        <Card className="bg-white shadow-sm border-gray-200 max-w-4xl mx-auto mb-12">
          <CardHeader>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Listing Selling Secrets
              </h2>
              <p className="text-xl text-[#176FFF] font-semibold mb-2">
                May 14th - 15th
              </p>
              <div className="space-y-1 text-gray-700">
                <p className="font-medium">May 14th - Founding Members Day (Founding Members Only)</p>
                <p className="font-medium">May 15th - Workshop (Everyone is welcomed)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 lg:px-8">
            
            {/* Included Notice */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                This workshop is INCLUDED in your Diamond+ membership
              </p>
              <p className="text-red-600 font-medium">
                You must RSVP below with your plus one before March 31st
              </p>
            </div>

            {/* Itinerary */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Itinerary</h3>
              
              {/* May 14th */}
              <div className="bg-amber-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-amber-600" />
                  <h4 className="text-lg font-bold text-gray-900">May 14th - Founding Members Day</h4>
                  <span className="text-sm bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Founding Members Only</span>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-amber-700 w-16">7 AM</span>
                    <span>Golf Tee Time - TBD</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-amber-700 w-16">1 PM</span>
                    <span>Mastermind - Island House Hotel</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-amber-700 w-16">6 PM</span>
                    <span>Dinner - TBD</span>
                  </div>
                </div>
              </div>

              {/* May 15th */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-[#176FFF]" />
                  <h4 className="text-lg font-bold text-gray-900">May 15th - Listing Selling Secrets</h4>
                </div>
                
                {/* Optional Workout */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">(Optional) 6 AM Workout</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Bodenhamer Center @ 310 W 19th Ave, Gulf Shores, AL 36542
                  </p>
                </div>

                {/* Workshop Location */}
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-[#176FFF] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Workshop Location</p>
                    <p className="text-gray-700">Island House Hotel</p>
                    <p className="text-gray-600 text-sm">26650 Perdido Beach Blvd, Orange Beach, AL 36561</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#176FFF]" />
                  <div>
                    <p className="font-semibold text-gray-900">9 AM - 5 PM</p>
                    <p className="text-gray-600 text-sm">Lunch will be included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel Discount */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="h-5 w-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Hotel Discount</h3>
              </div>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">Island House Hotel - Orange Beach, Alabama</p>
                <p>
                  To book via phone, call <a href="tel:251-981-6100" className="text-[#176FFF] font-medium hover:underline">251-981-6100</a> and tell them <span className="font-semibold">"Listing Selling Secrets"</span>
                </p>
                <p className="text-lg font-semibold text-green-700">
                  Beachfront rooms for $219 per night
                </p>
              </div>
            </div>

            {/* RSVP Button */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
                RSVP Now
              </h3>
              
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-2">
                  Click the button below to complete your RSVP for the workshop
                </p>
                <p className="text-red-600 font-medium mb-6">
                  Deadline: March 31st
                </p>
                <Button
                  className="bg-[#176FFF] hover:bg-[#1460E5] text-white px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <a 
                    href="https://forms.gle/WBWxgCFg7Dp4x8ka9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Complete RSVP Form
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
