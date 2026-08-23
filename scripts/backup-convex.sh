#!/usr/bin/env bash
#
# Snapshot the Convex production database to _backups/.
#
# Production data (projects, inventory, assignments, contact submissions) lives only in Convex.
# Vercel holds no copy, and an accidental `convex import --replace-all` or a bad migration is not
# reversible without one of these files.
#
# Usage:
#   ./scripts/backup-convex.sh            # production (default)
#   ./scripts/backup-convex.sh dev        # the dev deployment
#
# Restore:
#   npx convex import --prod --replace-all _backups/<file>.zip
#
# Snapshots contain customer names and email addresses. _backups/ is gitignored; keep it that way.

set -euo pipefail

cd "$(dirname "$0")/.."

TARGET="${1:-prod}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p _backups

if [ "$TARGET" = "prod" ]; then
    DEPLOY_FLAG="--prod"
    LABEL="prod"
else
    DEPLOY_FLAG=""
    LABEL="dev"
fi

OUT="_backups/ccs-${LABEL}-${STAMP}.zip"

# The repo pins VERCEL/VERCEL_ENV empty because a past `vercel env pull` wrote VERCEL=1 into
# .env.local, which makes the Convex CLI think it is running inside a Vercel build.
VERCEL= VERCEL_ENV= npx convex export ${DEPLOY_FLAG} --path "$OUT"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"

# Keep the 14 most recent snapshots per deployment so the directory does not grow without bound.
ls -1t _backups/ccs-${LABEL}-*.zip 2>/dev/null | tail -n +15 | while read -r old; do
    echo "Pruning $old"
    rm -f "$old"
done
