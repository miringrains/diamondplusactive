#!/bin/bash

echo "Adding non-null assertions after session.user checks..."

# Find all TypeScript files
find src -name "*.ts" -type f | while read file; do
    # Check if the file has the session.user check
    if grep -q "!session || !session.user" "$file"; then
        # Add non-null assertions for session.user usages
        sed -i 's/session\.user\.id/session.user!.id/g' "$file"
        sed -i 's/session\.user\.email/session.user!.email/g' "$file"
        sed -i 's/session\.user\.role/session.user!.role/g' "$file"
        sed -i 's/session\.user\.name/session.user!.name/g' "$file"
        
        # Fix double assertions
        sed -i 's/session\.user!!\.id/session.user!.id/g' "$file"
        sed -i 's/session\.user!!\.email/session.user!.email/g' "$file"
        sed -i 's/session\.user!!\.role/session.user!.role/g' "$file"
        sed -i 's/session\.user!!\.name/session.user!.name/g' "$file"
        
        echo "Fixed: $file"
    fi
done

echo "Done!"

