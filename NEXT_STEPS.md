# Next Steps - Diamond District Setup

## 1. Run AWS Commands on Your LOCAL Machine

I've prepared all the commands you need. Copy and paste this entire block into your LOCAL terminal (where you have AWS configured):

```bash
# Create the s3-cors-policy.json file
cat > s3-cors-policy.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["https://watch.zerotodiamond.com", "http://localhost:3000"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Create the iam-policy.json file
cat > iam-policy.json << 'EOF'
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
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::diamond-district-videos"
    }
  ]
}
EOF

# Apply CORS to your bucket
aws s3api put-bucket-cors --bucket diamond-district-videos --cors-configuration file://s3-cors-policy.json

# Create IAM user
aws iam create-user --user-name diamond-district-s3

# Attach policy
aws iam put-user-policy --user-name diamond-district-s3 --policy-name DiamondDistrictS3Access --policy-document file://iam-policy.json

# Create access key - SAVE THE OUTPUT!
aws iam create-access-key --user-name diamond-district-s3
```

## 2. Save Your AWS Credentials

The last command will output something like:
```json
{
    "AccessKey": {
        "UserName": "diamond-district-s3",
        "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
        "Status": "Active",
        "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "CreateDate": "2024-01-01T12:00:00.000Z"
    }
}
```

**SAVE THE AccessKeyId AND SecretAccessKey!**

## 3. Update Server Configuration

SSH back into your server and update the credentials:

```bash
cd /root/project/diamond-district
nano .env.local
```

Find these lines and replace with your actual credentials:
```
AWS_ACCESS_KEY_ID="YOUR-ACCESS-KEY-HERE"        # Replace with your AccessKeyId
AWS_SECRET_ACCESS_KEY="YOUR-SECRET-KEY-HERE"    # Replace with your SecretAccessKey
```

Also update:
- `DATABASE_URL` - Your PostgreSQL password
- `ADMIN_PASSWORD` - Your desired admin password

## 4. Test S3 Connection

```bash
npm run test:s3
```

## 5. Configure Domain DNS

Add an A record at your domain registrar:
- Type: A
- Name: watch
- Value: 165.227.78.164

## 6. Run Production Setup

Once DNS is configured:
```bash
sudo ./setup-production.sh
```

## Current Status:
- ✅ S3 bucket created
- ✅ Server has AWS CLI installed
- ✅ Configuration files ready
- ✅ .env.local created with production URLs
- ⏳ Waiting for: AWS credentials from IAM user creation
- ⏳ Waiting for: DNS configuration