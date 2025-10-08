#!/bin/bash

# Fix all Prisma table references to use plural form
echo "Fixing Prisma table references..."

# Fix user -> users
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/prisma\.user\./prisma.users./g'

# Fix lesson -> lessons  
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/prisma\.lesson\./prisma.lessons./g'

# Fix course -> courses
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/prisma\.course\./prisma.courses./g'

# Fix progress -> progress (already correct but check)
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/prisma\.progress\./prisma.progress./g'

# Fix relation references in include objects
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/lesson: {/lessons: {/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/course: {/courses: {/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/user: {/users: {/g'

echo "Done fixing Prisma table references!"