#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# DIRECT_URL is used for direct DB connections (bypassing pgbouncer pooler).
# Fall back to DATABASE_URL when not set (e.g. Vercel without a separate direct URL).
export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

# Generate Prisma client from schema (doesn't connect to DB)
npx prisma generate --schema=../../packages/database/prisma/schema.prisma

# Only push schema on Vercel deployments (not CI or local)
if [ "$VERCEL" = "1" ]; then
  echo "Running prisma db push..."
  npx prisma db push --schema=../../packages/database/prisma/schema.prisma --skip-generate --accept-data-loss
fi

next build
