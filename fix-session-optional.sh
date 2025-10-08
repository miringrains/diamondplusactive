#!/bin/bash

echo "Fixing session.user with optional chaining..."

# Replace session.user.id with session.user?.id
find src -name "*.ts" -type f -exec sed -i 's/session\.user\.id/session.user?.id/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user\.email/session.user?.email/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user\.name/session.user?.name/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user\.role/session.user?.role/g' {} \;

# Fix double optional chaining
find src -name "*.ts" -type f -exec sed -i 's/session\.user?\?\.id/session.user?.id/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user?\?\.email/session.user?.email/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user?\?\.name/session.user?.name/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/session\.user?\?\.role/session.user?.role/g' {} \;

echo "Fixed session optional chaining"

