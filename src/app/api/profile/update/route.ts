import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, location, bio } = await request.json()
    
    console.log('[Profile Update] Received data:', { name, phone, location, bio })
    
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
      full_name: name,
      phone: phone || null,
      location: location || null,
      bio: bio || null,
      updated_at: new Date().toISOString()
    }
    
    console.log('[Profile Update] Update data:', updateData)
    
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
    
    // Update the user metadata in auth
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { 
        full_name: name,
        phone,
        location,
        bio
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
