#!/bin/bash

# Fix all admin authentication checks to include !session.user check

# Find all files with the pattern and fix them
find src/app/api -name "*.ts" -type f -exec grep -l "session\.user\.role !== \"ADMIN\"" {} \; | while read file; do
    echo "Fixing $file"
    # Use sed to replace the pattern
    sed -i 's/if (!session || session\.user\.role !== "ADMIN")/if (!session || !session.user || session.user.role !== "ADMIN")/g' "$file"
done

echo "All admin auth checks have been fixed!"

