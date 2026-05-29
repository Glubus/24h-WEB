#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

git pull --ff-only
# docker compose -f compose.yml up -d --build
docker compose up --build