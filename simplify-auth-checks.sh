#!/bin/bash

echo "Simplifying auth checks..."

# Revert complex auth checks back to simple ones
find src -name "*.ts" -type f -exec sed -i 's/if (!session || !session\.user || session\.user?\.role/if (!session || session.user?.role/g' {} \;

# Also check for the ones without role check
find src -name "*.ts" -type f -exec sed -i 's/if (!session || !session\.user)/if (!session)/g' {} \;

echo "Simplified auth checks"

