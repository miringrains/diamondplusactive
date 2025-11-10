/**
 * Email utility for sending emails via Mailgun
 */

import { env } from './env'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email via Mailgun API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if Mailgun is configured
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN || !env.MAILGUN_FROM) {
      console.warn('[Email] Mailgun not configured - email sending disabled', {
        hasApiKey: !!env.MAILGUN_API_KEY,
        hasDomain: !!env.MAILGUN_DOMAIN,
        hasFrom: !!env.MAILGUN_FROM,
      })
      return false
    }

    // Create FormData for Mailgun API
    const formData = new FormData()
    formData.append('from', env.MAILGUN_FROM)
    formData.append('to', options.to)
    formData.append('subject', options.subject)
    formData.append('html', options.html)
    
    // Add text version if provided
    if (options.text) {
      formData.append('text', options.text)
    }

    // Send to Mailgun API
    const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Email] ❌ Mailgun API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`Mailgun API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('[Email] ✅ Email sent successfully via Mailgun:', {
      to: options.to,
      messageId: result.id || result.message,
    })
    return true
  } catch (error) {
    console.error('[Email] ❌ Failed to send email:', {
      to: options.to,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}

