import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Sanitize text to prevent UTF-8 encoding issues
function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null
  
  return text
    // Replace smart quotes with regular quotes
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
    // Replace em/en dashes with regular dash
    .replace(/[\u2013\u2014]/g, '-')
    // Replace ellipsis character with three dots
    .replace(/\u2026/g, '...')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove any non-printable characters except newlines/tabs
    .replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, '')
    // Normalize Unicode (fixes corrupted encoding)
    .normalize('NFC')
    // Trim whitespace
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, location, bio } = await request.json()
    
    // Sanitize all text inputs
    const sanitizedName = sanitizeText(name)
    const sanitizedPhone = sanitizeText(phone)
    const sanitizedLocation = sanitizeText(location)
    const sanitizedBio = sanitizeText(bio)
    
    console.log('[Profile Update] Received data:', { name: sanitizedName, phone: sanitizedPhone, location: sanitizedLocation, bioLength: sanitizedBio?.length })
    
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('[Profile Update] Auth error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('[Profile Update] Updating profile for user:', user.id)
    
    // Update the user's profile in the profiles table
    // Note: phone, location, bio are now dedicated columns (not in metadata)
    const updateData = {
      full_name: sanitizedName,
      phone: sanitizedPhone,
      location: sanitizedLocation,
      bio: sanitizedBio,
      updated_at: new Date().toISOString()
    }
    
    console.log('[Profile Update] Update data (sanitized):', updateData)
    
    const { data: updateResult, error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
    
    if (profileError) {
      console.error('[Profile Update] Error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError.message },
        { status: 500 }
      )
    }
    
    console.log('[Profile Update] Success! Updated rows:', updateResult)
    
    // Update the user metadata in auth (also sanitized)
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { 
        full_name: sanitizedName,
        phone: sanitizedPhone,
        location: sanitizedLocation,
        bio: sanitizedBio
      }
    })
    
    if (metadataError) {
      console.error('[Profile Update] Metadata update error:', metadataError)
    }
    
    console.log('[Profile Update] Complete!')
    return NextResponse.json({ success: true, updated: updateResult })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
