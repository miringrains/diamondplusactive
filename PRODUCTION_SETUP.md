# Diamond District Production Setup Guide

## Part 1: AWS S3 Video Storage Setup

### 1. Create AWS Account and S3 Bucket

1. **Create AWS Account** (if you don't have one):
   - Go to https://aws.amazon.com
   - Sign up for a free account

2. **Create S3 Bucket**:
   ```bash
   # Using AWS CLI (optional)
   aws s3 mb s3://diamond-district-videos --region us-east-1
   ```
   
   Or via AWS Console:
   - Go to S3 service
   - Click "Create bucket"
   - Bucket name: `diamond-district-videos` (must be globally unique)
   - Region: Choose closest to your users (e.g., us-east-1)
   - Uncheck "Block all public access" (we'll use signed URLs)
   - Enable versioning (recommended)
   - Create bucket

3. **Configure Bucket CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["https://watch.zerotodiamond.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

### 2. Create IAM User for S3 Access

1. Go to IAM → Users → Add User
2. User name: `diamond-district-s3`
3. Select "Programmatic access"
4. Create new policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl",
        "s3:GetObjectAcl"
      ],
      "Resource": "arn:aws:s3:::diamond-district-videos/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::diamond-district-videos"
    }
  ]
}
```

5. Save the Access Key ID and Secret Access Key

### 3. Install AWS SDK

```bash
cd /root/project/diamond-district
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 4. Update Environment Variables

Add to your `.env.local`:
```bash
# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
S3_BUCKET_NAME="diamond-district-videos"

# CloudFront (optional but recommended)
CLOUDFRONT_DOMAIN="https://dxxxxx.cloudfront.net"
```

### 5. Create S3 Service

Create `src/lib/s3.ts`:
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadVideoToS3(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `videos/${Date.now()}-${filename}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })
  
  await s3Client.send(command)
  return key
}

export async function getSignedVideoUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  })
  
  // URL expires in 1 hour
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return url
}
```

### 6. Update Video API Route

Update `src/app/api/videos/[filename]/route.ts` to serve from S3:
```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSignedVideoUrl } from "@/lib/s3"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const { filename } = await params
    
    // Get lesson by video filename or S3 key
    const lesson = await prisma.lesson.findFirst({
      where: {
        videoUrl: {
          contains: filename
        }
      }
    })
    
    if (!lesson) {
      return new NextResponse("Video not found", { status: 404 })
    }
    
    // Generate signed URL for S3
    const signedUrl = await getSignedVideoUrl(lesson.videoUrl)
    
    // Redirect to signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Error serving video:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
```

## Part 2: Domain Configuration (watch.zerotodiamond.com)

### 1. Update DNS Records

Add these DNS records at your domain registrar:
```
Type: A
Name: watch
Value: 165.227.78.164
TTL: 300
```

### 2. Install and Configure Nginx

```bash
# Install Nginx if not already installed
sudo apt update
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/diamond-district
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name watch.zerotodiamond.com;

    # Redirect HTTP to HTTPS (after SSL is set up)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase body size limit for video uploads
    client_max_body_size 500M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/diamond-district /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Install SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d watch.zerotodiamond.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### 4. Update Nginx Configuration for SSL

After Certbot runs, your Nginx config will be updated automatically. Verify it looks like this:
```nginx
server {
    listen 80;
    server_name watch.zerotodiamond.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name watch.zerotodiamond.com;

    ssl_certificate /etc/letsencrypt/live/watch.zerotodiamond.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/watch.zerotodiamond.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 500M;
}
```

### 5. Update Environment Variables for Production

Update `.env.local`:
```bash
# Update these for production
NEXTAUTH_URL="https://watch.zerotodiamond.com"
NEXT_PUBLIC_APP_URL="https://watch.zerotodiamond.com"

# Make sure this is secure
NEXTAUTH_SECRET="generate-secure-secret-with-openssl-rand-base64-32"

# Update admin email to real email
ADMIN_EMAIL="admin@zerotodiamond.com"

# Ensure NODE_ENV is production
NODE_ENV="production"
```

### 6. Build and Deploy

```bash
cd /root/project/diamond-district

# Build the application
npm run build

# Start with PM2
pm2 delete diamond-district 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Check logs
pm2 logs diamond-district
```

### 7. Set Up Auto-renewal for SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job, verify it exists:
sudo systemctl status certbot.timer
```

## Part 3: Migration Steps for Existing Videos

If you have existing videos in `/public/videos`, migrate them to S3:

1. Create a migration script `scripts/migrate-videos-to-s3.ts`:
```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { readdir, readFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/db"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function migrateVideos() {
  const videosDir = path.join(process.cwd(), "public", "videos")
  const files = await readdir(videosDir)
  
  for (const file of files) {
    if (file.endsWith('.mp4') || file.endsWith('.webm')) {
      console.log(`Migrating ${file}...`)
      
      const filePath = path.join(videosDir, file)
      const fileContent = await readFile(filePath)
      
      const key = `videos/${file}`
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: fileContent,
        ContentType: file.endsWith('.mp4') ? 'video/mp4' : 'video/webm',
      }))
      
      // Update database
      await prisma.lesson.updateMany({
        where: {
          videoUrl: {
            contains: file
          }
        },
        data: {
          videoUrl: key
        }
      })
      
      console.log(`✓ Migrated ${file}`)
    }
  }
}

migrateVideos().catch(console.error)
```

## CloudFront CDN Setup (Recommended)

For better video performance globally:

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket
   - Origin Access Identity: Create new
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache behaviors: Set based on your needs

2. **Update S3 Bucket Policy** to allow CloudFront:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR_OAI_ID"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::diamond-district-videos/*"
    }
  ]
}
```

3. **Update environment** with CloudFront domain:
```bash
CLOUDFRONT_DOMAIN="https://dxxxxx.cloudfront.net"
```

## Security Checklist

- [ ] Strong NEXTAUTH_SECRET generated
- [ ] Database password changed from default
- [ ] Admin password changed from default
- [ ] S3 bucket not publicly accessible
- [ ] CloudFront Origin Access Identity configured
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (allow 80, 443, 22 only)
- [ ] Regular backups configured

## Monitoring

Set up monitoring with:
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
pm2 logs diamond-district
```

## Troubleshooting

1. **Domain not working**: Check DNS propagation at https://dnschecker.org
2. **SSL issues**: Run `sudo certbot certificates` to check status
3. **502 Bad Gateway**: Check if app is running with `pm2 status`
4. **S3 access denied**: Verify IAM permissions and bucket policy
5. **Slow video loading**: Consider CloudFront CDN