import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { env } from '@/lib/env'

// GoHighLevel API Configuration
const GHL_API_BASE = 'https://services.leadconnectorhq.com'

/**
 * Webhook endpoint to receive Formspree submissions and forward to GoHighLevel form
 * 
 * Formspree will POST to this endpoint when business audit form is submitted
 * We then transform and forward to GoHighLevel form submission API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse Formspree webhook payload
    // Formspree sends data in format: { _formspree: '...', fieldName: 'value', ... }
    const formData = await request.formData()
    
    // Convert FormData to object
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      // Skip Formspree internal fields
      if (key.startsWith('_')) continue
      data[key] = typeof value === 'string' ? value : value.toString()
    }

    console.log('[Formspree->GHL] Received business audit submission:', {
      email: data.email,
      timestamp: new Date().toISOString()
    })

    // Get GHL credentials from environment
    const ghlPrivateKey = env.GHL_PRIVATE_KEY
    const ghlLocationId = env.GHL_LOCATION_ID

    if (!ghlPrivateKey || !ghlLocationId) {
      console.error('[Formspree->GHL] Missing GHL credentials')
      return NextResponse.json(
        { error: 'GoHighLevel not configured' },
        { status: 500 }
      )
    }

    // Map form fields to GoHighLevel form submission format
    // GoHighLevel expects form field names/IDs - you may need to adjust these
    // based on your actual GHL form field names
    const ghlSubmission: Record<string, any> = {
      locationId: ghlLocationId,
      // Contact information
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      
      // Section 1: Engagement & Accountability
      qaAttendance: data.qaAttendance || '',
      qaNotWhy: data.qaNotWhy || '',
      accountabilityEmails: data.accountabilityEmails || '',
      accountabilityNotWhy: data.accountabilityNotWhy || '',
      
      // Section 2: Performance Metrics
      absCount: data.absCount || '',
      closings: data.closings || '',
      activeListings: data.activeListings || '',
      pendingDeals: data.pendingDeals || '',
      
      // Section 3: Growth & Goal Setting
      impossibleGoal: data.impossibleGoal || '',
      biggestConstraint: data.biggestConstraint || '',
      goal1: data.goal1 || '',
      goal2: data.goal2 || '',
      goal3: data.goal3 || '',
      
      // Program Feedback
      programRating: data.programRating || '',
      improvementSuggestions: data.improvementSuggestions || '',
      
      // Section 4: Notes
      additionalNotes: data.additionalNotes || '',
      whatInspiredYou: data.whatInspiredYou || '',
    }

    // Try direct form submission first, then fallback to webhook if configured
    const ghlWebhookUrl = process.env.GHL_BUSINESS_AUDIT_WEBHOOK_URL
    const formId = 'P2RKeJhdfmhZnf4yfdnj'
    
    // Method 1: Try direct form submission API (if available)
    // This submits directly to the form like a user would
    try {
      // GHL form submission endpoint - format may vary
      const formSubmissionUrl = `${GHL_API_BASE}/forms/${formId}/submissions`
      
      const submissionPayload = {
        locationId: ghlLocationId,
        formId: formId,
        // Map all form fields - adjust field names to match your GHL form field IDs
        fields: {
          // Basic contact fields
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          
          // Map other fields - these field names may need to match your GHL form field IDs
          // You may need to inspect your GHL form to get exact field IDs
          'qaAttendance': data.qaAttendance || '',
          'qaNotWhy': data.qaNotWhy || '',
          'accountabilityEmails': data.accountabilityEmails || '',
          'accountabilityNotWhy': data.accountabilityNotWhy || '',
          'absCount': data.absCount || '',
          'closings': data.closings || '',
          'activeListings': data.activeListings || '',
          'pendingDeals': data.pendingDeals || '',
          'impossibleGoal': data.impossibleGoal || '',
          'biggestConstraint': data.biggestConstraint || '',
          'goal1': data.goal1 || '',
          'goal2': data.goal2 || '',
          'goal3': data.goal3 || '',
          'programRating': data.programRating || '',
          'improvementSuggestions': data.improvementSuggestions || '',
          'additionalNotes': data.additionalNotes || '',
          'whatInspiredYou': data.whatInspiredYou || '',
        }
      }

      const response = await axios.post(
        formSubmissionUrl,
        submissionPayload,
        {
          headers: {
            Authorization: `Bearer ${ghlPrivateKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
        }
      )

      console.log('[Formspree->GHL] Successfully submitted to GHL form:', {
        email: data.email,
        status: response.status
      })

      return NextResponse.json({
        success: true,
        message: 'Business audit submitted to GoHighLevel form'
      })

    } catch (formError: any) {
      // If direct form submission fails, try inbound webhook if configured
      if (ghlWebhookUrl) {
        console.log('[Formspree->GHL] Direct form submission failed, trying webhook:', formError.message)
        
        try {
          const webhookResponse = await axios.post(
            ghlWebhookUrl,
            {
              ...ghlSubmission,
              source: 'diamond-plus-portal',
              submittedAt: new Date().toISOString(),
              formType: 'business-audit'
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          console.log('[Formspree->GHL] Successfully forwarded to GHL webhook:', {
            email: data.email,
            status: webhookResponse.status
          })

          return NextResponse.json({
            success: true,
            message: 'Business audit submitted to GoHighLevel via webhook'
          })

        } catch (webhookError: any) {
          console.error('[Formspree->GHL] Both methods failed:', {
            formError: formError.response?.data || formError.message,
            webhookError: webhookError.response?.data || webhookError.message
          })

          return NextResponse.json(
            {
              error: 'Failed to submit to GoHighLevel',
              details: {
                formSubmission: formError.response?.data || formError.message,
                webhook: webhookError.response?.data || webhookError.message
              }
            },
            { status: 500 }
          )
        }
      } else {
        // Neither method worked and no webhook configured
        console.error('[Formspree->GHL] Form submission failed and no webhook configured:', {
          status: formError.response?.status,
          data: formError.response?.data,
          message: formError.message
        })

        return NextResponse.json(
          {
            error: 'Failed to submit to GoHighLevel form',
            details: formError.response?.data || formError.message,
            suggestion: 'Try setting GHL_BUSINESS_AUDIT_WEBHOOK_URL for alternative method'
          },
          { status: 500 }
        )
      }
    }

  } catch (error: any) {
    console.error('[Formspree->GHL] Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}

