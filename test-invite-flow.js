// Test the invite flow directly using Supabase Admin API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://birthcsvtmayyxrzzyhh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testInviteFlow() {
  const testEmail = `test-${Date.now()}@example.com`;
  
  console.log('Testing invite flow with email:', testEmail);
  
  try {
    // First, check if we can invite a user with a specific redirect
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(testEmail, {
      redirectTo: 'https://diamondplusportal.com/set-password?flow=invite',
      data: {
        source: 'ghl',
        first_name: 'Test',
        last_name: 'User'
      }
    });

    if (error) {
      console.error('Error inviting user:', error);
      return;
    }

    console.log('✅ Invite sent successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('\nCheck the email for:', testEmail);
    console.log('\nIMPORTANT: The invite link should redirect to /set-password');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testInviteFlow();
