# Video Upload System Guide

## Overview
The Diamond District platform supports large video uploads (up to 5GB) with real-time progress tracking, background uploading, and automatic retry capabilities.

## Features

### 1. Background Uploads
- Uploads continue even if you navigate away from the page
- Upload state is persisted in localStorage
- Uploads are restored when you return to the admin page

### 2. Real-Time Progress
- Shows actual upload progress from 0-100%
- Visual progress bar with file size display
- Upload speed automatically adjusts based on connection

### 3. Large File Support
- **Local Storage**: Up to 1GB files
- **S3 Storage**: Up to 5GB files using multipart upload
- Automatic routing to appropriate endpoint based on file size

### 4. Error Handling
- Automatic retry options for failed uploads
- Clear failed uploads individually or in bulk
- Detailed error messages for troubleshooting

## Usage

### Uploading a Video

1. Navigate to `/admin/courses/[courseId]`
2. Fill in the lesson details:
   - Title (required)
   - Description (optional)
3. Select your video file (MP4, WebM, OGG, or MOV)
4. Click "Upload Video & Create Lesson"
5. The upload will start immediately with real-time progress

### Managing Uploads

#### During Upload
- **Cancel**: Click the X button to cancel an active upload
- **Leave Page**: Safe to navigate away - upload continues in background

#### After Upload
- **Clear Completed**: Remove successful uploads from the list
- **Clear Failed**: Remove all failed/cancelled uploads at once
- **Retry Failed**: Click the retry button on failed uploads

### Upload Queue Controls
- **Clear Failed (X)**: Shows count of failed uploads, removes them all
- **Clear All**: Removes all uploads from the queue

## Technical Details

### Infrastructure
- **Nginx**: 1GB client_max_body_size, 30-minute timeout
- **PM2**: 2GB memory limit, auto-restart on crash
- **Node.js**: 2GB heap size allocation

### Storage Options
1. **Local Storage** (`/public/videos/`)
   - Files under 100MB by default
   - Direct file system write
   - Served via `/api/videos/[filename]`

2. **AWS S3** (when configured)
   - Files over 100MB use multipart upload
   - Automatic chunk size calculation
   - Signed URLs for secure access

### API Endpoints
- `/api/upload` - Standard upload (< 100MB)
- `/api/upload/large` - Large file upload with multipart support

### Error Recovery
The system automatically handles:
- Network interruptions (can retry)
- Server timeouts (increased to 30 minutes)
- Memory issues (PM2 auto-restart)
- Browser refresh (localStorage persistence)

## Troubleshooting

### Upload Stuck at 0%
1. Check browser console for errors
2. Verify file is under 5GB
3. Check network connection
4. Try refreshing and retrying

### 502 Bad Gateway
- Server is restarting (wait 30 seconds)
- File too large for current memory
- Check PM2 logs: `pm2 logs diamond-district`

### Upload Fails Immediately
- Check file format (must be video)
- Verify you're logged in as admin
- Check S3 credentials if using AWS

### Lost Upload Progress
- Uploads are saved in localStorage
- Return to the same course page
- Progress should restore automatically

## Best Practices

1. **File Preparation**
   - Compress videos before upload when possible
   - Use MP4 format for best compatibility
   - Keep files under 900MB for optimal performance

2. **Upload Management**
   - Upload during off-peak hours for large files
   - Clear completed uploads regularly
   - Monitor failed uploads and retry as needed

3. **Browser Considerations**
   - Use Chrome/Firefox for best performance
   - Keep browser tab open for fastest uploads
   - Don't clear browser data during uploads

## Configuration

### Environment Variables
```env
# For S3 uploads (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
```

### Nginx Settings
```nginx
client_max_body_size 1G;
client_body_timeout 1800s;
proxy_read_timeout 1800s;
```

### PM2 Configuration
```javascript
max_memory_restart: '2G',
node_args: '--max-old-space-size=2048'
```

## Support

For issues with uploads:
1. Check the browser console for errors
2. Review PM2 logs: `pm2 logs diamond-district --lines 100`
3. Verify Nginx is running: `systemctl status nginx`
4. Check disk space: `df -h`