#!/bin/bash

echo "Fixing all session.user optional chaining where we've already checked for session.user..."

# Find all files that have the check for session.user and fix the optional chaining
find src -name "*.ts" -type f | while read file; do
    if grep -q "!session || !session.user" "$file"; then
        # Remove optional chaining in this file since we've checked for user
        sed -i 's/session\.user?\.id/session.user.id/g' "$file"
        sed -i 's/session\.user?\.email/session.user.email/g' "$file"
        sed -i 's/session\.user?\.role/session.user.role/g' "$file"
        sed -i 's/session\.user?\.name/session.user.name/g' "$file"
        echo "Fixed: $file"
    fi
done

echo "Done!"

