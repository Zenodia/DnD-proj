#!/usr/bin/env bash
# Source tarball for Ubuntu setup: excludes node_modules, .next, secrets, etc.
# Recipient: bash env/setup-ubuntu.sh && cp .env.example .env && pnpm install && cd apps/web && npm run build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXCLUDES="$(dirname "$0")/tarball-excludes.txt"
NAME="${TARBALL_NAME:-dnd-reworked.tar.gz}"
OUTPUT="${TARBALL_OUTPUT:-$(dirname "$ROOT")/$NAME}"
PROJECT="$(basename "$ROOT")"

if [[ ! -f "$EXCLUDES" ]]; then
  echo "missing exclude file: $EXCLUDES" >&2
  exit 1
fi

TAR_EXCLUDES=(--exclude-from="$EXCLUDES")
if [[ "${TARBALL_INCLUDE_GIT:-}" != "1" ]]; then
  TAR_EXCLUDES+=(--exclude="$PROJECT/.git")
fi
TAR_EXCLUDES+=(--exclude="$PROJECT/.claude/file-history")

cd "$(dirname "$ROOT")"
tar -czf "$OUTPUT" "${TAR_EXCLUDES[@]}" "$PROJECT"
echo "$OUTPUT"
