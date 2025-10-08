const https = require('https');

async function testAuth() {
  console.log('Testing authentication flow...\n');

  // Step 1: Get CSRF token
  console.log('1. Getting CSRF token...');
  const csrfResponse = await fetch('https://watch.zerotodiamond.com/api/auth/csrf');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;
  console.log('CSRF Token:', csrfToken);

  // Extract cookies from response
  const cookies = csrfResponse.headers.get('set-cookie');
  console.log('Cookies received:', cookies);

  // Step 2: Attempt login
  console.log('\n2. Attempting login...');
  const loginResponse = await fetch('https://watch.zerotodiamond.com/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies || ''
    },
    body: new URLSearchParams({
      email: 'admin@diamonddistrict.com',
      password: 'DiamondAdmin2024!',
      csrfToken: csrfToken,
      json: 'true'
    }),
    redirect: 'manual'
  });

  console.log('Login Response Status:', loginResponse.status);
  console.log('Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
  
  if (loginResponse.status === 302 || loginResponse.status === 303) {
    console.log('Redirect Location:', loginResponse.headers.get('location'));
  }

  const loginCookies = loginResponse.headers.get('set-cookie');
  console.log('Login Cookies:', loginCookies);

  // Step 3: Check session
  console.log('\n3. Checking session...');
  const sessionResponse = await fetch('https://watch.zerotodiamond.com/api/auth/session', {
    headers: {
      'Cookie': loginCookies || cookies || ''
    }
  });
  const sessionData = await sessionResponse.json();
  console.log('Session Data:', JSON.stringify(sessionData, null, 2));

  // Step 4: Test middleware redirect
  console.log('\n4. Testing middleware redirect by accessing /login while authenticated...');
  const loginPageResponse = await fetch('https://watch.zerotodiamond.com/login', {
    headers: {
      'Cookie': loginCookies || cookies || ''
    },
    redirect: 'manual'
  });
  console.log('Login Page Response Status:', loginPageResponse.status);
  if (loginPageResponse.status === 302 || loginPageResponse.status === 303 || loginPageResponse.status === 307) {
    console.log('Redirect Location:', loginPageResponse.headers.get('location'));
  }
}

testAuth().catch(console.error);