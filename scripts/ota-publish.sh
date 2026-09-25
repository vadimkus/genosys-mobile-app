#!/usr/bin/env bash
# The only supported way to publish an OTA update.
#   npm run ota -- ios "Message"            guard, then eas update (iOS)
#   npm run ota -- android "Message"
#   npm run ota -- ios "Message" --accept-patch-drift
# Publishes one platform at a time so each is checked against its own binary.
set -euo pipefail
cd "$(dirname "$0")/.."

platform="${1:-}"; message="${2:-}"; extra="${3:-}"
if [[ "$platform" != "ios" && "$platform" != "android" ]] || [[ -z "$message" ]]; then
  echo 'Usage: npm run ota -- ios|android "Message" [--accept-patch-drift]' >&2
  exit 1
fi

node scripts/ota-guard.js --platform "$platform" ${extra}
npm run -s verify:release
npx eas-cli update --channel production --environment production --platform "$platform" --message "$message" --non-interactive
if [[ -n "${SENTRY_AUTH_TOKEN:-}" ]]; then
  SENTRY_ORG=genosys-middle-east-fz-llc SENTRY_PROJECT=genosys-mobile-app SENTRY_URL=https://de.sentry.io/ \
    npx sentry-expo-upload-sourcemaps dist
else
  echo 'SENTRY_AUTH_TOKEN not set locally: source maps not uploaded for this update.' >&2
fi
