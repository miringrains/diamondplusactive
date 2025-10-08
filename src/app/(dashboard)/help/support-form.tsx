'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Send } from "lucide-react"
import { toast } from "sonner"

interface SupportFormProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function SupportForm({ user }: SupportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    supportType: '',
    subject: '',
    message: '',
    additionalInfo: ''
  })

  const supportTypes = [
    { value: 'technical', label: 'Technical Support', description: 'Login issues, video playback, site errors' },
    { value: 'billing', label: 'Billing & Account', description: 'Subscription, payments, account management' },
    { value: 'content', label: 'Content Access', description: 'Missing content, access permissions' },
    { value: 'training', label: 'Training Questions', description: 'Questions about modules, strategies' },
    { value: 'feature', label: 'Feature Request', description: 'Suggestions for new features' },
    { value: 'other', label: 'Other', description: 'General inquiries' }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitFormData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value)
    })
    
    try {
      const response = await fetch('https://formspree.io/f/xldplegp', {
        method: 'POST',
        body: submitFormData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Message sent successfully! We'll get back to you soon.")
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again or email us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardContent className="p-8">
        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-green-100 p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Message Sent Successfully!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We've received your message and will respond within 1-2 business days. 
              Check your email at <span className="font-medium text-gray-900">{formData.email}</span> for our reply.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setFormData(prev => ({
                  ...prev,
                  phone: '',
                  supportType: '',
                  subject: '',
                  message: '',
                  additionalInfo: ''
                }))
              }}
              className="shadow-sm"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-gray-700 mb-2 block">
                  Phone Number <span className="text-gray-400 text-sm">(Optional)</span>
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

            <div className="border-t pt-6"></div>

            {/* Support Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Support Details
              </h3>
              
              <div>
                <Label htmlFor="supportType" className="text-gray-700 mb-2 block">
                  Support Type <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.supportType} 
                  onValueChange={(value) => handleChange('supportType', value)}
                  required
                >
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors">
                    <SelectValue placeholder="Select a support category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-gray-700 mb-2 block">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700 mb-2 block">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Please describe your question or issue in detail..."
                  className="min-h-[120px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  rows={5}
                />
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Information
              </h3>
              
              <div>
                <Label htmlFor="additionalInfo" className="text-gray-700 mb-2 block">
                  Any other details that might help us assist you
                </Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleChange('additionalInfo', e.target.value)}
                  placeholder="Browser type, error messages, steps to reproduce the issue, etc."
                  className="min-h-[100px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  rows={4}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium shadow-sm transition-all hover:shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Support Request
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              We typically respond within 1-2 business days • Support hours: Mon-Fri 9AM-5PM CST
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
