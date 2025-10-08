#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if old video components are being used
const oldComponents = [
  'VideoPlayerClient',
  'VideoPlayerEnhanced',
  'video-player-client',
  'video-player-enhanced'
];

const errors = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  oldComponents.forEach(component => {
    if (content.includes(component) && 
        !filePath.includes('video-player-') && 
        !filePath.includes('video-island') &&
        !filePath.includes('verify-video-components')) {
      errors.push(`Found usage of ${component} in ${filePath}`);
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        walkDir(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      checkFile(filePath);
    }
  });
}

// Check src directory
const srcDir = path.join(__dirname, '..', 'src');
walkDir(srcDir);

if (errors.length > 0) {
  console.error('❌ Found usage of deprecated video components:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
} else {
  console.log('✅ No usage of deprecated video components found');
}
