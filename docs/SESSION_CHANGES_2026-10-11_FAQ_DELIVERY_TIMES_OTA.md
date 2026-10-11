# FAQ delivery times OTA (11 Oct 2026)

App FAQ now matches the website: Dubai 1-2 hours, other emirates 24-36 hours (EN a2/a5, RU/AR a3). Commit `6186698`.

- Android: group `207b1006-e6fb-4724-981b-3ae04b54b16e`, runtime 1.13.0.
- iOS: group `eb4bfe69-c64b-4d3f-ae2f-dbe982603a41`, runtime 1.13.0, `--accept-patch-drift` (known expo 57.0.22 -> 57.0.23
  patch drift on binary 48c52c7ba).
- Do not run `npm run ota` for both platforms in parallel: they share `dist/` and the first iOS upload failed with
  "Cannot parse an empty JSON string" on `dist/assetmap.json`.
- Sentry source maps not uploaded (no `SENTRY_AUTH_TOKEN` locally).

## Returns 10 days (22:25)

Commit `fb2cf0b`: EN FAQ a6/a10, terms p1, return checklist (7 days) and RU/AR FAQ a2 (30 days) now 10 days.
OTA Android `97152a58-d1c6-495d-a877-651a5c643d6f`, iOS `8391558e-5c29-464e-8b88-bd6ac0646e0e` (runtime 1.13.0, run one after the other).
