#!/bin/bash
set -e

SCHEMA="../../packages/database/prisma/schema.prisma"

# Prisma Client must exist before Next.js can bundle routes that import it —
# this needs no DB connection, so it's safe to run in any environment.
npx prisma generate --schema="$SCHEMA"

# Syncing the schema to the live database only makes sense where DATABASE_URL
# actually points at it. Vercel sets VERCEL=1 during builds; plain CI (GitHub
# Actions lint/build checks) has no production DB and shouldn't push to one.
if [ "$VERCEL" = "1" ]; then
  npx prisma db push --schema="$SCHEMA" --skip-generate --accept-data-loss
fi

next build
