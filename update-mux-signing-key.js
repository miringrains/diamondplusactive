#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SIGNING_KEY_ID = 'WGUd01tyW001TO9zzC6t7JHM19ioGQot02DRG02FRp6cfoo';
const PEM_FILE = `mux-${SIGNING_KEY_ID}.pem`;

console.log('Mux Signing Key Update Script');
console.log('==============================');
console.log(`Signing Key ID: ${SIGNING_KEY_ID}`);
console.log(`Looking for PEM file: ${PEM_FILE}`);

// Try to read the PEM file
let pemContent;
try {
  pemContent = fs.readFileSync(path.join(__dirname, PEM_FILE), 'utf8');
  console.log('✓ Found PEM file');
} catch (error) {
  console.error(`✗ Could not find PEM file: ${PEM_FILE}`);
  console.log('\nPlease either:');
  console.log(`1. Place the PEM file at: ${path.join(__dirname, PEM_FILE)}`);
  console.log('2. Or paste the PEM content below (including BEGIN/END lines):');
  process.exit(1);
}

// Convert PEM to base64
const base64Key = Buffer.from(pemContent).toString('base64');
console.log('✓ Converted PEM to base64');

// Generate environment variable lines
console.log('\n=== Add these to your .env file ===\n');
console.log(`MUX_SIGNING_KEY_ID=${SIGNING_KEY_ID}`);
console.log(`MUX_SIGNING_KEY_BASE64=${base64Key}`);
console.log('\n===================================');

// Also write to a temporary file for easy copying
const envLines = `
# Mux Signing Key Configuration
MUX_SIGNING_KEY_ID=${SIGNING_KEY_ID}
MUX_SIGNING_KEY_BASE64=${base64Key}
`;

fs.writeFileSync('mux-signing-key-env.txt', envLines);
console.log('\n✓ Also saved to: mux-signing-key-env.txt');

// Test the decoding
try {
  const decoded = Buffer.from(base64Key, 'base64').toString('utf8');
  console.log(`\n✓ Verification: Base64 decodes correctly (${decoded.length} bytes)`);
  console.log(`✓ Key starts with: ${decoded.substring(0, 30)}...`);
} catch (error) {
  console.error('✗ Failed to decode base64 - something went wrong!');
}
