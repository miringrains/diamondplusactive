#!/bin/bash

echo "Reverting Prisma-related changes..."

# Remove crypto imports
find src -name "*.ts" -type f -exec sed -i '/^import crypto from "crypto"$/d' {} \;

# Remove id: crypto.randomUUID() assignments
find src -name "*.ts" -type f -exec sed -i 's/id: crypto\.randomUUID(),//g' {} \;

# Remove updatedAt: new Date() assignments in create operations
find src -name "*.ts" -type f -exec sed -i 's/updatedAt: new Date(),//g' {} \;

echo "Reverted changes. Now let's check what we have..."
grep -r "crypto\.randomUUID" src --include="*.ts" | wc -l

