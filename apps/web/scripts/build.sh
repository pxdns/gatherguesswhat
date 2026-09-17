#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# Generate Prisma client from schema (doesn't connect to DB)
npx prisma generate --schema=../../packages/database/prisma/schema.prisma

# Only push schema on Vercel deployments (not CI or local)
if [ "$VERCEL" = "1" ]; then
  echo "Running prisma db push..."
  npx prisma db push --schema=../../packages/database/prisma/schema.prisma --skip-generate --accept-data-loss
fi

next build
