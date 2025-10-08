// Test login functionality
const fetch = require('node-fetch');

async function testLogin() {
  const loginUrl = 'https://diamondplusportal.com/api/auth/session';
  
  try {
    // First check session endpoint
    const sessionResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Session endpoint status:', sessionResponse.status);
    console.log('Session headers:', sessionResponse.headers.raw());
    
    // Now test Supabase directly
    const supabaseUrl = 'https://birthcsvtmayyxrzzyhh.supabase.co/auth/v1/token?grant_type=password';
    const supabaseResponse = await fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcnRoY3N2dG1heXl4cnp6eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU2MjgsImV4cCI6MjA3Mzk1MTYyOH0.rqvnSSt5as1JBiqqEH02ktTwfdUvqp7armaImUizFfA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'kevin@breakthruweb.com',
        password: 'Lovemym60@'
      })
    });
    
    const supabaseData = await supabaseResponse.json();
    console.log('\nSupabase login test:', supabaseResponse.status);
    console.log('Supabase user:', supabaseData.user?.email);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
