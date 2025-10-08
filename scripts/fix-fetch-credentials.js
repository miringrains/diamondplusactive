#!/usr/bin/env node

// Script to add credentials: 'include' to all fetch calls
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/(dashboard)/lessons/[id]/LessonViewEnhanced.tsx',
  'src/app/(dashboard)/lessons/[id]/LessonViewClient.tsx',
  'src/app/(dashboard)/lessons/[id]/LessonViewServerSync.tsx',
  'src/components/admin/video-player-with-notes.tsx',
  'src/components/admin/lesson-progress-tracker.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join('/root/project/diamond-district', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: fetch with object on same line
    content = content.replace(/fetch\((.*?),\s*\{/g, (match, url) => {
      if (!match.includes('credentials')) {
        modified = true;
        return `fetch(${url}, {\n        credentials: 'include',`;
      }
      return match;
    });
    
    // Pattern 2: fetch with method POST/PUT
    content = content.replace(/method:\s*['"]POST['"]/g, (match) => {
      modified = true;
      return `credentials: 'include',\n        method: 'POST'`;
    });
    
    content = content.replace(/method:\s*['"]PUT['"]/g, (match) => {
      modified = true;
      return `credentials: 'include',\n        method: 'PUT'`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`- No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\nDone! All fetch calls now include credentials.');
