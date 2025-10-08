#!/bin/bash

# Diamond District S3 Setup Script

echo "======================================"
echo "Diamond District S3 Setup"
echo "======================================"
echo ""
echo "This script will help you complete the S3 setup."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp env.local.template .env.local
    
    # Generate secure secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update the file with production values
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://watch.zerotodiamond.com\"|g" .env.local
    sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://watch.zerotodiamond.com\"|g" .env.local
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.local
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres:password@localhost:5432/diamond_district\"|g" .env.local
    
    echo "✓ Created .env.local with production settings"
else
    echo "✓ .env.local already exists"
fi

echo ""
echo "======================================"
echo "MANUAL STEPS REQUIRED"
echo "======================================"
echo ""
echo "1. From your LOCAL machine (where you ran 'aws s3 mb'), run these commands:"
echo ""
echo "   # Configure CORS for your S3 bucket"
echo "   aws s3api put-bucket-cors --bucket diamond-district-videos --cors-configuration file://s3-cors-policy.json"
echo ""
echo "   # Create IAM user"
echo "   aws iam create-user --user-name diamond-district-s3"
echo ""
echo "   # Attach policy to user"
echo "   aws iam put-user-policy --user-name diamond-district-s3 --policy-name DiamondDistrictS3Access --policy-document file://iam-policy.json"
echo ""
echo "   # Create access key (SAVE THE OUTPUT!)"
echo "   aws iam create-access-key --user-name diamond-district-s3"
echo ""
echo "2. Copy the AccessKeyId and SecretAccessKey from the output above"
echo ""
echo "3. Edit .env.local on this server and replace:"
echo "   AWS_ACCESS_KEY_ID=\"YOUR-ACCESS-KEY-HERE\""
echo "   AWS_SECRET_ACCESS_KEY=\"YOUR-SECRET-KEY-HERE\""
echo "   With your actual credentials"
echo ""
echo "4. Also update the database password if needed:"
echo "   DATABASE_URL=\"postgresql://postgres:YOUR-DB-PASSWORD@localhost:5432/diamond_district\""
echo ""
echo "5. Update the admin password:"
echo "   ADMIN_PASSWORD=\"YourSecureAdminPassword\""
echo ""
echo "======================================"
echo ""
read -p "Press Enter when you've completed the above steps..."

# Test S3 connection
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Testing S3 connection..."
npm run test:s3

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ S3 setup complete!"
    echo ""
    echo "Next step: Configure your domain DNS"
    echo "Add an A record pointing 'watch.zerotodiamond.com' to 165.227.78.164"
    echo ""
    echo "Once DNS is configured, run:"
    echo "  sudo ./setup-production.sh"
else
    echo ""
    echo "❌ S3 connection test failed. Please check your credentials and try again."
    echo "Edit .env.local to fix the AWS credentials."
fi