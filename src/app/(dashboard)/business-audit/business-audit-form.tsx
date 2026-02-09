'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, Send } from "lucide-react"
import { toast } from "sonner"

interface BusinessAuditFormProps {
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
  }
}

export function BusinessAuditForm({ user }: BusinessAuditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    qaAttendance: '',
    qaNotWhy: '',
    accountabilityEmails: '',
    accountabilityNotWhy: '',
    absCount: '',
    closings: '',
    activeListings: '',
    pendingDeals: '',
    grossCommissions: '',
    prospectsAdded: '',
    impossibleGoal: '',
    biggestConstraint: '',
    goal1: '',
    goal2: '',
    goal3: '',
    programRating: [5],
    improvementSuggestions: '',
    additionalNotes: '',
    whatInspiredYou: ''
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/business-audit/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          programRating: formData.programRating[0]
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSubmitted(true)
        toast.success("Business audit submitted successfully! Thank you for your feedback.")
      } else {
        throw new Error(data.error || 'Failed to submit audit')
      }
    } catch (error) {
      toast.error("Failed to submit business audit. Please try again or contact support.")
      console.error('Business audit submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | number[]) => {
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
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Audit Submitted Successfully!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Thank you for taking time to fill out your monthly Business Audit. Ricky will be reviewing 
              yours and provide our ACR any specific points that we should target as we grow your Business 
              in our Diamond+ Coaching Program. Along with discussing at the upcoming Q&A (every Monday 1p-3p ET). 
              Until next time, KEEP SELLING!
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setFormData(prev => ({
                  ...prev,
                  qaAttendance: '',
                  qaNotWhy: '',
                  accountabilityEmails: '',
                  accountabilityNotWhy: '',
                  absCount: '',
                  closings: '',
                  activeListings: '',
                  pendingDeals: '',
                  grossCommissions: '',
                  prospectsAdded: '',
                  impossibleGoal: '',
                  biggestConstraint: '',
                  goal1: '',
                  goal2: '',
                  goal3: '',
                  programRating: [5],
                  improvementSuggestions: '',
                  additionalNotes: '',
                  whatInspiredYou: ''
                }))
              }}
              className="shadow-sm"
            >
              Submit Another Audit
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hidden fields for auto-populated user data */}
            <input type="hidden" name="firstName" value={formData.firstName} />
            <input type="hidden" name="lastName" value={formData.lastName} />
            <input type="hidden" name="email" value={formData.email} />
            {formData.phone && <input type="hidden" name="phone" value={formData.phone} />}
            
            {/* Section 1: Engagement & Accountability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                SECTION 1 — Engagement & Accountability
              </h3>
              
              <div>
                <Label htmlFor="qaAttendance" className="text-gray-700 mb-2 block">
                  Did you attend Monday Q&A Zoom Calls this month? <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.qaAttendance} 
                  onValueChange={(value) => handleChange('qaAttendance', value)}
                >
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900">
                    <SelectValue placeholder="Select an option" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Yes, all!" className="text-gray-900">Yes, all!</SelectItem>
                    <SelectItem value="Some" className="text-gray-900">Some</SelectItem>
                    <SelectItem value="None" className="text-gray-900">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.qaAttendance === 'Some' || formData.qaAttendance === 'None' ? (
                <div>
                  <Label htmlFor="qaNotWhy" className="text-gray-700 mb-2 block">
                    If not, why?
                  </Label>
                  <Textarea
                    id="qaNotWhy"
                    value={formData.qaNotWhy}
                    onChange={(e) => handleChange('qaNotWhy', e.target.value)}
                    className="min-h-[80px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                    placeholder="Please explain..."
                  />
                </div>
              ) : null}

              <div>
                <Label htmlFor="accountabilityEmails" className="text-gray-700 mb-2 block">
                  Did you show up to your monthly accountability zoom call? <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.accountabilityEmails} 
                  onValueChange={(value) => handleChange('accountabilityEmails', value)}
                >
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900">
                    <SelectValue placeholder="Select an option" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Yes" className="text-gray-900">Yes</SelectItem>
                    <SelectItem value="No" className="text-gray-900">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.accountabilityEmails === 'No' ? (
                <div>
                  <Label htmlFor="accountabilityNotWhy" className="text-gray-700 mb-2 block">
                    If not, why?
                  </Label>
                  <Textarea
                    id="accountabilityNotWhy"
                    value={formData.accountabilityNotWhy}
                    onChange={(e) => handleChange('accountabilityNotWhy', e.target.value)}
                    className="min-h-[80px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                    placeholder="Please explain..."
                  />
                </div>
              ) : null}
            </div>

            <div className="border-t pt-6"></div>

            {/* Section 2: Performance Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                SECTION 2 — Performance Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="absCount" className="text-gray-700 mb-2 block">
                    Number of True ABSs <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="absCount"
                    name="absCount"
                    type="number"
                    min="0"
                    value={formData.absCount}
                    onChange={(e) => handleChange('absCount', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="closings" className="text-gray-700 mb-2 block">
                    Number of closings last month <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="closings"
                    name="closings"
                    type="number"
                    min="0"
                    value={formData.closings}
                    onChange={(e) => handleChange('closings', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activeListings" className="text-gray-700 mb-2 block">
                    Number of Active Listings <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="activeListings"
                    name="activeListings"
                    type="number"
                    min="0"
                    value={formData.activeListings}
                    onChange={(e) => handleChange('activeListings', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pendingDeals" className="text-gray-700 mb-2 block">
                    Number of deals currently pending <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pendingDeals"
                    name="pendingDeals"
                    type="number"
                    min="0"
                    value={formData.pendingDeals}
                    onChange={(e) => handleChange('pendingDeals', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grossCommissions" className="text-gray-700 mb-2 block">
                    Total Gross Commissions last month <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="grossCommissions"
                    name="grossCommissions"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.grossCommissions}
                    onChange={(e) => handleChange('grossCommissions', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prospectsAdded" className="text-gray-700 mb-2 block">
                    Total prospects added to the database last month <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prospectsAdded"
                    name="prospectsAdded"
                    type="number"
                    min="0"
                    value={formData.prospectsAdded}
                    onChange={(e) => handleChange('prospectsAdded', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Section 3: Growth & Goal Setting */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                SECTION 3 — Growth & Goal Setting
              </h3>
              
              <div>
                <Label htmlFor="impossibleGoal" className="text-gray-700 mb-2 block">
                  What's your big 3-5 year impossible goal? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="impossibleGoal"
                  value={formData.impossibleGoal}
                  onChange={(e) => handleChange('impossibleGoal', e.target.value)}
                  className="min-h-[100px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  placeholder="What's your big 3-5 year impossible goal?"
                />
              </div>

              <div>
                <Label htmlFor="biggestConstraint" className="text-gray-700 mb-2 block">
                  Your Biggest Current Constraint (what's holding you back?) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="biggestConstraint"
                  value={formData.biggestConstraint}
                  onChange={(e) => handleChange('biggestConstraint', e.target.value)}
                  className="min-h-[100px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  placeholder="What's the biggest thing holding you back?"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">
                  Goals for Next Month (specific & measurable) <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="goal1" className="text-sm text-gray-600 mb-1 block">Goal 1: *</Label>
                    <Input
                      id="goal1"
                      name="goal1"
                      type="text"
                      value={formData.goal1}
                      onChange={(e) => handleChange('goal1', e.target.value)}
                      className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="Specific, measurable goal..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal2" className="text-sm text-gray-600 mb-1 block">Goal 2: *</Label>
                    <Input
                      id="goal2"
                      name="goal2"
                      type="text"
                      value={formData.goal2}
                      onChange={(e) => handleChange('goal2', e.target.value)}
                      className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="Specific, measurable goal..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal3" className="text-sm text-gray-600 mb-1 block">Goal 3: (optional)</Label>
                    <Input
                      id="goal3"
                      name="goal3"
                      type="text"
                      value={formData.goal3}
                      onChange={(e) => handleChange('goal3', e.target.value)}
                      className="h-11 bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900"
                      placeholder="Additional goal (optional)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Section 4: Rating & Feedback */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Program Feedback
              </h3>
              
              <div>
                <Label htmlFor="programRating" className="text-gray-700 mb-3 block">
                  How do you rate the Diamond+ Coaching Program? <span className="text-red-500">*</span>
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({formData.programRating[0]}/10)
                  </span>
                </Label>
                <div className="px-2">
                  <Slider
                    id="programRating"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.programRating}
                    onValueChange={(value) => handleChange('programRating', value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Bad (1)</span>
                    <span>Good (10)</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="improvementSuggestions" className="text-gray-700 mb-2 block">
                  How can we make Diamond+ better for you? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="improvementSuggestions"
                  value={formData.improvementSuggestions}
                  onChange={(e) => handleChange('improvementSuggestions', e.target.value)}
                  className="min-h-[120px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  placeholder="Your suggestions for improvement..."
                />
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Section 5: Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                SECTION 4 — Inspiration
              </h3>
              
              <div>
                <Label htmlFor="additionalNotes" className="text-gray-700 mb-2 block">
                  What was your biggest breakthrough this month? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  className="min-h-[120px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  placeholder="What was your biggest breakthrough this month?"
                />
              </div>

              <div>
                <Label htmlFor="whatInspiredYou" className="text-gray-700 mb-2 block">
                  What inspired you the most this month? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="whatInspiredYou"
                  value={formData.whatInspiredYou}
                  onChange={(e) => handleChange('whatInspiredYou', e.target.value)}
                  className="min-h-[120px] bg-gray-50 border-gray-300 focus:bg-white transition-colors text-gray-900 resize-none"
                  placeholder="What inspired you most this month?"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium shadow-sm transition-all hover:shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Business Audit
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Complete this form at the end of each month to track your business growth and align with your 90-Day Action Plan.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

