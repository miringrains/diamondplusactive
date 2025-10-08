const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://birthcsvtmayyxrzzyhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcnRoY3N2dG1heXl4cnp6eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU2MjgsImV4cCI6MjA3Mzk1MTYyOH0.rqvnSSt5as1JBiqqEH02ktTwfdUvqp7armaImUizFfA'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=minimal'
    }
  }
})

async function testProfileQuery() {
  console.log('Testing profile query...')
  
  // Test 1: Direct query
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', '21ee3d3b-5f83-40dd-99bc-a0f5d827748a')
    .single()
  
  if (error) {
    console.error('Error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('Success:', data)
  }
  
  // Test 2: Query with different method
  const { data: data2, error: error2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '21ee3d3b-5f83-40dd-99bc-a0f5d827748a')
    .maybeSingle()
  
  if (error2) {
    console.error('Error 2:', error2)
  } else {
    console.log('Success 2:', data2)
  }
}

testProfileQuery()
