#!/bin/bash

# Script to update AWS credentials in .env.local

echo "======================================"
echo "Update AWS Credentials"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found!"
    exit 1
fi

# Prompt for AWS credentials
read -p "Enter your AWS Access Key ID: " AWS_KEY
read -p "Enter your AWS Secret Access Key: " AWS_SECRET

# Update the .env.local file
sed -i "s|AWS_ACCESS_KEY_ID=\"YOUR-ACCESS-KEY-HERE\"|AWS_ACCESS_KEY_ID=\"$AWS_KEY\"|g" .env.local
sed -i "s|AWS_SECRET_ACCESS_KEY=\"YOUR-SECRET-KEY-HERE\"|AWS_SECRET_ACCESS_KEY=\"$AWS_SECRET\"|g" .env.local

echo ""
echo "✓ AWS credentials updated in .env.local"
echo ""
echo "Testing S3 connection..."
echo ""

# Test the connection
npm run test:s3

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! S3 is configured correctly."
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain DNS (point watch.zerotodiamond.com to 165.227.78.164)"
    echo "2. Run: sudo ./setup-production.sh"
else
    echo ""
    echo "❌ S3 connection test failed. Please check your credentials."
fi