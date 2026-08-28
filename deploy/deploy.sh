#!/usr/bin/env bash
# deploy.sh — fetch the newest source and rebuild in place. Idempotent.
#
#   cd /opt/apps/portfolio && sudo deploy/deploy.sh
#
# One script rather than the pull-and-restart the other apps use: this service
# is built from source, so `docker compose pull` has nothing to fetch and would
# report success while changing nothing.
set -euo pipefail

BRANCH="${BRANCH:-dev}"
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$HERE/.." && pwd)"

cd "$REPO_ROOT"

# Shared Traefik network — no-op if it already exists.
docker network create web >/dev/null 2>&1 || true

git fetch --depth 1 origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# --build because the image is compiled here; without it a deploy silently
# reuses the previous build.
docker compose -f deploy/docker-compose.yml up -d --build
docker image prune -f >/dev/null 2>&1 || true

echo "portfolio deployed from origin/$BRANCH ($(git rev-parse --short HEAD))"
