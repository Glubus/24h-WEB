#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

git pull --ff-only
docker compose -f compose.prod.yml up -d --build
