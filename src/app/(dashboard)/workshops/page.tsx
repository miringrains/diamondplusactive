'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Calendar, MapPin, Users, Home, ChevronRight, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function WorkshopsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plusOneName: '',
    foundingMember: '',
    comments: ''
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitFormData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value)
    })
    
    try {
      const response = await fetch('https://formspree.io/f/xkgqqvjd', {
        method: 'POST',
        body: submitFormData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("RSVP submitted successfully! We'll see you at the workshop.")
      } else {
        throw new Error('Failed to submit RSVP')
      }
    } catch (error) {
      toast.error("Failed to submit RSVP. Please try again or contact support.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              Intensive workshops on specific topics
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        {/* 2026 Business Planning Workshop */}
        <Card className="bg-white shadow-sm border-gray-200 max-w-4xl mx-auto mb-12">
          <CardHeader>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                2026 Business Planning Workshop
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                December 5th 9-5 PM
              </p>
              <p className="text-md text-gray-600 mb-6">
                2026 Inner Circle Day December 4th (Founding Members Only)
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 lg:px-8">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                This is FREE OF CHARGE for members of any coaching program
              </p>
              <p className="text-gray-700">
                This is included as long as you are a member of Listing Mastery Coaching.
                I do these in person workshops every quarter.
                There are normally 50+ agents there, so it's very small group.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-[#176FFF]" />
                <h3 className="font-semibold text-gray-900 mb-1 text-center">Event Details</h3>
                <p className="text-gray-700 text-center">December 5th, 2026</p>
                <p className="text-gray-700 text-center">9:00 AM - 5:00 PM</p>
                <p className="text-gray-600 text-center text-sm mt-2">Lunch will be included</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-[#176FFF]" />
                <h3 className="font-semibold text-gray-900 mb-1 text-center">Location</h3>
                <p className="text-gray-700 text-center">Island House Hotel</p>
                <p className="text-gray-600 text-center text-sm">26650 Perdido Beach Blvd</p>
                <p className="text-gray-600 text-center text-sm">Orange Beach, AL 36561</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 mb-6">
              <p className="text-gray-900 font-medium mb-2">
                (Optional) 6 AM Workout
              </p>
              <p className="text-gray-700">
                Bodenhamer Center @ 310 W 19th Ave, Gulf Shores, AL 36542
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Hotel Discount</h3>
              <p className="text-gray-700 mb-2">Listing Selling Secrets</p>
              <p className="text-gray-700 mb-2">December 4-6th</p>
              <p className="text-gray-700 mb-2">To book via phone, call 251-981-6100 and use code <span className="font-mono font-semibold">CDT91Q</span></p>
              <p className="text-gray-700">To book online: <a href="https://group.doubletree.com/5akzai" target="_blank" rel="noopener noreferrer" className="text-[#176FFF] hover:underline">https://group.doubletree.com/5akzai</a></p>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
                RSVP Now
              </h3>
              
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-6">
                  Click the button below to complete your RSVP for the workshop
                </p>
                <Button
                  className="bg-[#176FFF] hover:bg-[#1460E5] text-white px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfwsjPgtz4vlfr_6BSPq6qb-GQi9Gk55cunh6ij_MP2u648-A/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Complete RSVP Form
                  </a>
                </Button>
              </div>
              
              {/* Commented out for future use - Formspree form implementation */}
              {/*
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    RSVP Submitted Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for registering. We'll see you at the workshop!
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        plusOneName: '',
                        foundingMember: '',
                        comments: ''
                      })
                    }}
                    className="bg-[#176FFF] hover:bg-[#1460E5] text-white"
                  >
                    Submit Another RSVP
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 mb-2 block">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 mb-2 block">
                        Phone number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="plusOneName" className="text-gray-700 mb-2 block">
                      Your Plus One Guest's First and Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="plusOneName"
                      name="plusOneName"
                      type="text"
                      required
                      value={formData.plusOneName}
                      onChange={(e) => handleChange('plusOneName', e.target.value)}
                      className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="Guest's full name"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-3 block">
                      If you are a Founding Member, will you be attending the Founders Day December 4th?
                    </Label>
                    <RadioGroup
                      value={formData.foundingMember}
                      onValueChange={(value: string) => handleChange('foundingMember', value)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="comments" className="text-gray-700 mb-2 block">
                      Comments
                    </Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={(e) => handleChange('comments', e.target.value)}
                      className="min-h-[100px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="Any additional information or questions..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#176FFF] hover:bg-[#1460E5] text-white font-medium"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit RSVP
                      </>
                    )}
                  </Button>
                </form>
              )}
              */}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
