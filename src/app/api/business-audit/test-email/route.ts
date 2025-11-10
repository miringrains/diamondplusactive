import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { getBusinessAuditConfirmationEmail } from '@/lib/email-templates/business-audit-confirmation'

/**
 * Test endpoint to send a business audit confirmation email
 * GET /api/business-audit/test-email?to=email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to') || 'kevin@breakthruweb.com'
    
    // Create a sample note body for testing
    const sampleNoteBody = `MONTHLY BUSINESS AUDIT SUBMISSION
Submitted: 11/03/2025 02:30 PM

SECTION 1 — ENGAGEMENT & ACCOUNTABILITY
──────────────────────────────────────

Q&A Attendance: Yes, all!
Did you show up to your monthly accountability zoom call?: Yes

SECTION 2 — PERFORMANCE METRICS
──────────────────────────────────────

Number of True ABSs: 15
Number of closings last month: 3
Active Listings: 8
Number of deals currently pending: 5
Total Gross Commissions last month: $45,000.00
Total prospects added to the database last month: 25

SECTION 3 — GROWTH & GOAL SETTING
──────────────────────────────────────

What's your big 3-5 year impossible goal?:
Build a $100M real estate business with systems and team

Biggest Constraint:
Time management and delegation

Goal 1: Hire two full-time agents
Goal 2: Close 50 deals this year
Goal 3: Build passive income streams

PROGRAM FEEDBACK
──────────────────────────────────────

Rating: 9/10

Improvement Suggestions:
More case studies and real-world examples would be helpful

SECTION 4 — ADDITIONAL INFORMATION
──────────────────────────────────────

What was your biggest breakthrough this month?:
Realized the importance of systematizing my listing process

What Inspired You This Month:
The Q&A session on building teams was game-changing

Submitted via Diamond+ Portal API`

    const submissionDate = '11/03/2025 02:30 PM'
    const firstName = 'Kevin'
    
    const emailHtml = getBusinessAuditConfirmationEmail(
      firstName,
      submissionDate,
      sampleNoteBody
    )
    
    const emailSent = await sendEmail({
      to: to,
      subject: `Your Monthly Business Audit Submission - 11/03/2025`,
      html: emailHtml,
    })
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        recipient: to,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to send test email to ${to}`,
        recipient: to,
        error: 'Email sending returned false - check logs for details',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

