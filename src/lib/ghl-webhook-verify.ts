import crypto from 'crypto'

/**
 * Verify GoHighLevel webhook signature
 * GHL signs webhooks with HMAC-SHA256
 */
export function verifyGHLWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    // GHL sends signature in header as 'X-GHL-Signature'
    // Format: sha256=<signature>
    const [method, sig] = signature.split('=')
    
    if (method !== 'sha256') {
      console.error('[GHL Webhook] Invalid signature method:', method)
      return false
    }

    // Create HMAC with secret
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    
    // Constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('[GHL Webhook] Signature verification error:', error)
    return false
  }
}
