#!/bin/bash
echo "=== Auth Pages Validation Suite ==="
echo ""

# Check build status
echo "1. Build Status Check:"
echo "---------------------"
DYNAMIC_COUNT=$(grep -E "ƒ /(register|reset-password|set-password|logout)" final-build.log 2>/dev/null | wc -l)
STATIC_COUNT=$(grep -E "○ /(register|reset-password|set-password|logout)" final-build.log 2>/dev/null | wc -l)

echo "Dynamic auth pages: $DYNAMIC_COUNT/4"
echo "Static auth pages: $STATIC_COUNT/4"

if [ $DYNAMIC_COUNT -eq 4 ] && [ $STATIC_COUNT -eq 0 ]; then
  echo "✅ All auth pages are dynamic!"
else
  echo "❌ Some auth pages are still static"
fi

echo ""
echo "2. File Structure Check:"
echo "-----------------------"
for page in register reset-password set-password logout; do
  if [ -f "src/app/(auth)/$page/page.tsx" ]; then
    HAS_USE_CLIENT=$(grep -c "use client" "src/app/(auth)/$page/page.tsx" || echo 0)
    if [ $HAS_USE_CLIENT -eq 0 ]; then
      echo "✅ /$page/page.tsx - No 'use client' (server component)"
    else
      echo "❌ /$page/page.tsx - Has 'use client' (should be server)"
    fi
  fi
done

echo ""
echo "3. Form Components Check:"
echo "------------------------"
for form in register-form reset-password-form set-password-form; do
  if [ -f "src/app/(auth)/${form%-form}/$form.tsx" ]; then
    HAS_USE_CLIENT=$(grep -c "use client" "src/app/(auth)/${form%-form}/$form.tsx" || echo 0)
    if [ $HAS_USE_CLIENT -gt 0 ]; then
      echo "✅ $form.tsx - Has 'use client' (client component)"
    else
      echo "❌ $form.tsx - Missing 'use client' (should be client)"
    fi
  fi
done

echo ""
echo "=== Validation Complete ===
