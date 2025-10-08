#!/bin/bash

echo "Testing login flow with proper cookie handling..."

# Create a cookie jar
COOKIE_JAR="/tmp/cookies.txt"
rm -f $COOKIE_JAR

# Step 1: Get CSRF token
echo "1. Getting CSRF token..."
CSRF_RESPONSE=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR https://watch.zerotodiamond.com/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
echo "CSRF Token: $CSRF_TOKEN"

# Step 2: Perform login
echo -e "\n2. Attempting login..."
LOGIN_RESPONSE=$(curl -s -i -X POST \
  -c $COOKIE_JAR \
  -b $COOKIE_JAR \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@diamonddistrict.com&password=DiamondAdmin2024!&csrfToken=$CSRF_TOKEN&json=true" \
  https://watch.zerotodiamond.com/api/auth/callback/credentials)

echo "Login response (first 500 chars):"
echo "$LOGIN_RESPONSE" | head -c 500

# Step 3: Check session
echo -e "\n\n3. Checking session..."
SESSION_RESPONSE=$(curl -s -b $COOKIE_JAR https://watch.zerotodiamond.com/api/auth/session)
echo "Session: $SESSION_RESPONSE"

# Step 4: Test accessing /login (should redirect if authenticated)
echo -e "\n4. Testing access to /login page (should redirect if authenticated)..."
LOGIN_PAGE_RESPONSE=$(curl -s -i -L -b $COOKIE_JAR https://watch.zerotodiamond.com/login | head -n 20)
echo "$LOGIN_PAGE_RESPONSE"

# Clean up
rm -f $COOKIE_JAR