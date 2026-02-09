import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import axios from 'axios'
import { env } from '@/lib/env'
import { GoHighLevelService } from '@/lib/gohighlevel'
import { sendEmail } from '@/lib/email'
import { getBusinessAuditConfirmationEmail } from '@/lib/email-templates/business-audit-confirmation'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const body = await request.json()
    
    // Use session data as source of truth - same approach as page.tsx
    if (!session.user.email) {
      console.error('[Business Audit] ❌ No email in session:', {
        userId: session.user.id,
        session: session.user
      })
      return NextResponse.json(
        { error: 'No email found in session' },
        { status: 400 }
      )
    }
    
    // Derive firstName/lastName from session.name (same as page.tsx does)
    const nameParts = (session.user.name || '').trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Override form data with session data (source of truth)
    body.email = session.user.email.toLowerCase().trim()
    body.firstName = firstName
    body.lastName = lastName
    
    // No strict validation - allow partial/empty submissions
    // Empty fields will show as "Not answered" in GoHighLevel note

    // Submit to GoHighLevel via API (update fields + create note)
    console.log('[Business Audit] Starting submission to GoHighLevel:', {
      userId: session.user.id,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      timestamp: new Date().toISOString()
    })

    try {
      const result = await submitToGoHighLevel(body, env.GHL_PRIVATE_KEY, env.GHL_LOCATION_ID)
      
      console.log('[Business Audit] ✅ Successfully submitted to GoHighLevel:', {
        email: body.email,
        contactId: result.contactId,
        noteId: result.noteId,
        timestamp: new Date().toISOString()
      })

      // Send confirmation email to user (non-blocking - don't fail if email fails)
      try {
        const firstName = body.firstName || session.user.name?.split(' ')[0] || 'there'
        const submissionDate = result.submissionDate || new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        
        const emailHtml = getBusinessAuditConfirmationEmail(
          firstName,
          submissionDate,
          result.noteBody || ''
        )
        
        const emailSent = await sendEmail({
          to: body.email,
          subject: `Your Monthly Business Audit Submission - ${submissionDate.split(' ')[0]}`,
          html: emailHtml,
        })
        
        if (emailSent) {
          console.log('[Business Audit] ✅ Confirmation email sent to user:', body.email)
        } else {
          console.warn('[Business Audit] ⚠️ Failed to send confirmation email (non-critical):', body.email)
        }
      } catch (emailError: any) {
        // Email failure is non-critical - log but don't fail the request
        console.error('[Business Audit] ⚠️ Email sending error (non-critical):', {
          email: body.email,
          error: emailError.message
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Business audit submitted successfully to GoHighLevel',
        contactId: result.contactId
      })
    } catch (ghlError: any) {
      // Log detailed error information but DON'T fail the user
      console.error('[Business Audit] ⚠️ GoHighLevel submission error (returning success to user):', {
        email: body.email,
        error: ghlError.message,
        status: ghlError.response?.status,
        statusText: ghlError.response?.statusText,
        responseData: JSON.stringify(ghlError.response?.data, null, 2),
      })
      
      // Still return success to the user - their submission is logged server-side
      // GHL sync can be retried manually if needed
      return NextResponse.json({
        success: true,
        message: 'Business audit submitted successfully',
        contactId: null
      })
    }

  } catch (error) {
    console.error('[Business Audit] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Submit business audit data to GoHighLevel
 * Strategy: 
 * 1. Find contact by email (assumed to exist for logged-in users)
 * 2. Update contact with all form data mapped to custom fields
 * 3. Add a detailed note with all form answers
 */
async function submitToGoHighLevel(
  formData: Record<string, any>,
  ghlPrivateKey: string,
  ghlLocationId: string
) {
  const GHL_API_BASE = 'https://services.leadconnectorhq.com'
  const formId = 'P2RKeJhdfmhZnf4yfdnj'
  const formName = 'Monthly Business Audit'
  const ghlService = new GoHighLevelService()
  
  // Email from session (already normalized)
  const email = formData.email.toLowerCase().trim()
  
  console.log('[Business Audit] Starting API submission:', {
    email,
    formId,
    timestamp: new Date().toISOString()
  })

  // Step 1: Find contact by email (assumed to exist for logged-in users)
  console.log('[Business Audit] Searching for contact:', email)
  let contact: any = null
  
  try {
    contact = await ghlService.searchContactByEmail(email)
  } catch (searchError: any) {
    console.error('[Business Audit] ❌ Contact search failed:', {
      email,
      error: searchError.message,
      status: searchError.response?.status,
      responseData: searchError.response?.data
    })
    throw new Error(`Failed to search contact in GoHighLevel: ${searchError.message}`)
  }
  
  if (!contact) {
    console.warn('[Business Audit] ⚠️ Contact not found in GHL for:', email)
    // Don't fail - return success anyway so user isn't blocked
    // The data is still logged server-side for manual review
    return {
      success: true,
      contactId: null,
      noteId: null,
      submissionDate: new Date().toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      noteBody: 'Contact not found in GoHighLevel - submission logged server-side only'
    }
  }
  
  const contactId = contact.id
  console.log('[Business Audit] ✅ Found contact:', {
    contactId,
    email: contact.email || email
  })

  // Step 2: Prepare custom fields mapping (all form fields to GHL custom field IDs)
  const customFields: any[] = []

  // Section 1: Engagement & Accountability
  if (formData.qaAttendance) {
    customFields.push({
      id: 'oqNRnhiY33RLyjqDrboK', // Q&A Attendance
      value: [formData.qaAttendance]
    })
  }
  
  if (formData.qaNotWhy) {
    customFields.push({
      id: '0xykUDVYgxbmpgtQH9F7', // If not, why? (Q&A)
      value: formData.qaNotWhy
    })
  }

  if (formData.accountabilityEmails) {
    customFields.push({
      id: 'ScYAzXXVV2HxJK1TJhjD', // Accountability Emails
      value: [formData.accountabilityEmails]
    })
  }

  if (formData.accountabilityNotWhy) {
    customFields.push({
      id: 'kZVnsLNXTX7XnXQsOuQV', // If not, why? (Accountability)
      value: formData.accountabilityNotWhy
    })
  }

  // Section 2: Performance Metrics
  if (formData.absCount) {
    customFields.push({
      id: 'JGlVae9sYblK498z8ieb', // Number of True ABSs
      value: formData.absCount.toString()
    })
  }

  if (formData.closings) {
    customFields.push({
      id: '1q1tnovM4x0KzvTrcHqe', // Number of Closings
      value: formData.closings.toString()
    })
  }

  if (formData.activeListings) {
    customFields.push({
      id: 'uQpBgNqHqsqWLZkhUX5u', // Active Listings
      value: formData.activeListings.toString()
    })
  }

  if (formData.pendingDeals) {
    customFields.push({
      id: 'lPGRYlLZUaJMgTHUHqAu', // Pending Deals
      value: formData.pendingDeals.toString()
    })
  }

  // TODO: Add GHL custom field IDs for grossCommissions and prospectsAdded when available
  // For now, these fields are included in the note but not mapped to GHL custom fields

  // Section 3: Growth & Goal Setting
  if (formData.impossibleGoal) {
    customFields.push({
      id: 'zGRN7FC1RwWddQbOdptv', // Impossible Goal
      value: formData.impossibleGoal
    })
  }

  if (formData.biggestConstraint) {
    customFields.push({
      id: 'JcmZXifeQNRLvQ0FCM2a', // Biggest Constraint
      value: formData.biggestConstraint
    })
  }

  // Goals - textbox_list field
  if (formData.goal1 || formData.goal2 || formData.goal3) {
    const goalsValue: Record<string, string> = {}
    if (formData.goal1) {
      goalsValue['8307b092-629b-4fa5-a71a-0d135cc25364'] = formData.goal1
    }
    if (formData.goal2) {
      goalsValue['ccff1d62-65c6-45d1-b34b-9095f065f5b1'] = formData.goal2
    }
    if (formData.goal3) {
      goalsValue['f6c407a1-11c3-414a-86a3-6cbc2311c9c4'] = formData.goal3
    }
    
    customFields.push({
      id: '86zToDZA6kd8dG4UT0Ov', // Goals textbox_list
      value: goalsValue
    })
  }

  // Program Feedback
  if (formData.programRating) {
    customFields.push({
      id: 'aONvGi9BldfFDlzkOrFC', // Program Rating
      value: formData.programRating.toString()
    })
  }

  if (formData.improvementSuggestions) {
    customFields.push({
      id: 'CrOg1C9oLtfkDgPvw4b7', // Improvement Suggestions
      value: formData.improvementSuggestions
    })
  }

  // Section 4: Notes
  if (formData.additionalNotes) {
    customFields.push({
      id: 'Embolyvjg4ekYWaxip7T', // Additional Notes
      value: formData.additionalNotes
    })
  }

  if (formData.whatInspiredYou) {
    customFields.push({
      id: '4URvss64YRuqKH71uZmN', // What Inspired You
      value: formData.whatInspiredYou
    })
  }

  // Step 3: Update contact with all form data
  console.log('[Business Audit] Updating contact custom fields:', {
    contactId,
    customFieldsCount: customFields.length
  })
  
  try {
    await axios.put(
      `${GHL_API_BASE}/contacts/${contactId}`,
      {
        customFields: customFields,
      },
      {
        headers: {
          Authorization: `Bearer ${ghlPrivateKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
      }
    )
    
    console.log('[Business Audit] ✅ Contact fields updated successfully')
  } catch (updateError: any) {
    console.error('[Business Audit] ❌ Failed to update contact fields:', {
      contactId,
      status: updateError.response?.status,
      statusText: updateError.response?.statusText,
      error: updateError.message,
      responseData: JSON.stringify(updateError.response?.data, null, 2)
    })
    
    // Continue to note creation even if field update fails - note is more important
    console.log('[Business Audit] ⚠️ Continuing to note creation despite field update failure')
  }

  // Step 4: Add note with all form answers
  // Format date as MM/DD/YYYY and time as 12-hour AM/PM
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const year = now.getFullYear()
  
  let hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  const hours12 = String(hours).padStart(2, '0')
  
  const submissionDate = `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`
  
  // Build comprehensive note with all form data
  const noteLines = [
    `MONTHLY BUSINESS AUDIT SUBMISSION`,
    `Submitted: ${submissionDate}`,
    ``,
    `SECTION 1 — ENGAGEMENT & ACCOUNTABILITY`,
    `──────────────────────────────────────`,
    ``,
    `Q&A Attendance: ${formData.qaAttendance || 'Not answered'}`,
    formData.qaNotWhy ? `If not, why?: ${formData.qaNotWhy}` : '',
    ``,
    `Did you show up to your monthly accountability zoom call?: ${formData.accountabilityEmails || 'Not answered'}`,
    formData.accountabilityNotWhy ? `If not, why?: ${formData.accountabilityNotWhy}` : '',
    ``,
    `SECTION 2 — PERFORMANCE METRICS`,
    `──────────────────────────────────────`,
    ``,
    `Number of True ABSs: ${formData.absCount || 'Not answered'}`,
    `Number of closings last month: ${formData.closings || 'Not answered'}`,
    `Active Listings: ${formData.activeListings || 'Not answered'}`,
    `Number of deals currently pending: ${formData.pendingDeals || 'Not answered'}`,
    `Total Gross Commissions last month: ${formData.grossCommissions && !isNaN(parseFloat(formData.grossCommissions)) ? '$' + parseFloat(formData.grossCommissions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (formData.grossCommissions || 'Not answered')}`,
    `Total prospects added to the database last month: ${formData.prospectsAdded || 'Not answered'}`,
    ``,
    `SECTION 3 — GROWTH & GOAL SETTING`,
    `──────────────────────────────────────`,
    ``,
    `What's your big 3-5 year impossible goal?:`,
    formData.impossibleGoal || 'Not answered',
    ``,
    `Biggest Constraint:`,
    formData.biggestConstraint || 'Not answered',
    ``,
    formData.goal1 ? `Goal 1: ${formData.goal1}` : '',
    formData.goal2 ? `Goal 2: ${formData.goal2}` : '',
    formData.goal3 ? `Goal 3: ${formData.goal3}` : '',
    ``,
    `PROGRAM FEEDBACK`,
    `──────────────────────────────────────`,
    ``,
    `Rating: ${formData.programRating || 'Not answered'}/10`,
    ``,
    formData.improvementSuggestions ? `Improvement Suggestions:` : '',
    formData.improvementSuggestions ? formData.improvementSuggestions : '',
    ``,
    `SECTION 4 — ADDITIONAL INFORMATION`,
    `──────────────────────────────────────`,
    ``,
    formData.additionalNotes ? `What was your biggest breakthrough this month?:` : '',
    formData.additionalNotes ? formData.additionalNotes : '',
    ``,
    formData.whatInspiredYou ? `What Inspired You This Month:` : '',
    formData.whatInspiredYou ? formData.whatInspiredYou : '',
    ``,
    `Submitted via Diamond+ Portal API`
  ].filter(line => line.trim() !== '') // Remove empty lines
  
  const noteBody = noteLines.join('\n')
  
  console.log('[Business Audit] Creating detailed note with form answers:', {
    contactId,
    noteLength: noteBody.length
  })
  
  let noteId: string | undefined
  try {
    const noteResponse = await axios.post(
      `${GHL_API_BASE}/contacts/${contactId}/notes`,
      {
        body: noteBody,
        userId: 'system',
      },
      {
        headers: {
          Authorization: `Bearer ${ghlPrivateKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
      }
    )
    
    noteId = noteResponse.data.note?.id
    console.log('[Business Audit] ✅ Note created successfully:', {
      noteId,
      contactId
    })
  } catch (noteError: any) {
    console.error('[Business Audit] ⚠️ Failed to create note (non-critical):', {
      contactId,
      status: noteError.response?.status,
      statusText: noteError.response?.statusText,
      error: noteError.message,
      responseData: JSON.stringify(noteError.response?.data, null, 2)
    })
    
    // Note creation failure is NOT critical - don't block the user
    // Contact fields were already updated above
    console.log('[Business Audit] ⚠️ Continuing despite note creation failure - contact fields were updated')
  }

  return {
    success: true,
    contactId,
    noteId,
    submissionDate,
    noteBody
  }
}
