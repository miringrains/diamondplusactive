#!/bin/bash

echo "Fixing all session.user checks..."

# Fix all instances where we check session but not session.user
find src -name "*.ts" -type f -exec sed -i -E '
    # Fix simple if (!session) patterns before accessing session.user
    s/if \(!session\)([^|])/if (!session || !session.user)\1/g
    
    # Fix patterns like if (session) { ... session.user.x }
    s/if \(session\)([^&])/if (session \&\& session.user)\1/g
' {} \;

# Show what was changed
echo "Fixed session checks. Running grep to verify remaining issues..."
grep -r "session\.user\." src --include="*.ts" | grep -v "session\.user?" | grep -v "!session\.user" | head -20

echo "Done!"

