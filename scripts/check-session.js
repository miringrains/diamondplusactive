#!/usr/bin/env node

/**
 * Quick script to check session status and timing
 * Run: node scripts/check-session.js
 */

const https = require('https');

function parseJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

function checkCookies() {
  // In a real scenario, you'd pass actual cookies
  console.log('📝 To check your session:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Application → Cookies');
  console.log('3. Look for: sb-access-token and sb-refresh-token');
  console.log('4. Check the JWT payload:');
  console.log('');
  console.log('Example JWT decode:');
  
  // Example token structure
  const examplePayload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    sub: 'user-id-here',
    email: 'user@example.com',
    role: 'authenticated',
    iat: Math.floor(Date.now() / 1000),
  };
  
  console.log(JSON.stringify(examplePayload, null, 2));
  console.log('');
  console.log('Key fields:');
  console.log('• exp: Expiration timestamp (Access token expires)');
  console.log('• iat: Issued at timestamp');
  console.log('• Time until expiry: exp - current_time');
  console.log('');
  
  const expiryTime = new Date(examplePayload.exp * 1000);
  console.log(`Example expiry: ${expiryTime.toLocaleString()}`);
}

console.log('🔐 Supabase Session Checker');
console.log('===========================');
console.log('');
console.log('Session Lifetimes:');
console.log('• Access Token: 1 hour (auto-refreshes)');
console.log('• Refresh Token: 1 week');
console.log('• If inactive > 1 week: Must login again');
console.log('');

checkCookies();

console.log('');
console.log('💡 Tips:');
console.log('• Sessions auto-refresh while you\'re active');
console.log('• Check browser DevTools → Network for auth refresh calls');
console.log('• Look for 401 errors = session expired');
console.log('• Middleware redirects to /login when session invalid');
