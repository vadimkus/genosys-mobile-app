# Session Changes — 2026-07-06 — Skin Analysis: quiz scoring was dead, now fixed + enhanced

## The core bug (quiz results were fake-personalized)

The 4-step quiz sent display labels to `/api/skin-recommendations`:
`skinType=Oily&ageGroup=Under 25&targetConcerns=Acne,Pores`

The server scores against canonical keys (`oily`, `young-adult`, `acne-blemishes`,
`pore-care`). Nothing matched, every profile scored ~13 points (below the 30 threshold),
and the API fell back to the same generic top-rated list — **every user got identical
"personalized" results regardless of their answers**. Verified live before the fix:
oily+acne and dry+wrinkles returned the same 4 products.

## Fixes

### Server (cosmetics-website `8b3e320f`)
- `getSkinRecommendations` now normalizes inputs (case, aliases: Acne→acne-blemishes,
  Wrinkles→anti-aging, Dark Spots/Dullness→brightening, Dryness→hydration,
  Redness→sensitivity, Pores→pore-care; Under 25→young-adult, 25-45→adult, 45+→mature).
  **This fixes already-shipped app binaries immediately** — no OTA needed for the fix.
- New `usage` param: `at-home` excludes PRO Solution category + price-on-request
  products (the quiz's step-4 answer was previously collected and thrown away).
- Response now includes `matchScore` + `matchedConcerns` per product so clients can
  show WHY a product was recommended.
- AI camera analysis prompt catalog updated with 5 newer products (Cerabarrier
  Cleanser 66, PDRN Homecare 5000 65, PDRN 60000 60, PDRN Mask Pack 52,
  Bio-Ferment Mask 51) — all IDs verified live.

### Mobile app (this repo)
- New `utils/skinAnalysisMapping.js` — canonical maps for concerns/age/usage.
- `app/skin-analysis.js`:
  - Quiz now sends canonical values + the previously-unused `usage` answer.
  - Results cards show green "match chips" — the user's own concerns that each
    product actually matched (from `matchedConcerns`).
  - Failed API call: "Try Again" now **retries the request** keeping all answers
    (previously it reset the whole quiz to step 0).
- `utils/skinRecommendations.js` (on-device fallback engine): `parseField` now parses
  JSON-array strings — product `targetConcerns` come as `'["anti-aging",...]'` and
  comma-splitting left brackets/quotes on every value, so concern matching never hit.
- `components/SkinAnalysisResults.js` (camera fallback results): profile concerns now
  canonical (`acne-blemishes` etc.) so they actually match product data.

## Verification (live, post-deploy)

- Legacy params `skinType=Oily&targetConcerns=Acne,Pores` → Problem Control line,
  matchScore 113, matchedConcerns acne-blemishes+pore-care.
- `skinType=Dry&targetConcerns=Wrinkles,Dryness` → PDRN/peptide anti-aging set
  (different from the acne profile — personalization is real now).
- `usage=at-home` → POWER SOLUTION PCS replaced by EPI Turnover Peeling Gel.
- `npx expo export` clean; OTA published to production, runtime 1.10.4
  (group `3992f6ec-065b-4f3e-bca7-af15442cdfa2`).

## Not changed (deliberately)

- On-device heuristic image analysis (`skinImageAnalysis.js`) — it samples compressed
  PNG bytes rather than decoded pixels, so it's approximate by design; it is only the
  offline fallback when the GPT-4o AI analysis fails. Flagged for a future rewrite
  (e.g. react-native-skia pixel access) if the fallback ever matters more.
- AI analysis is not persisted to `/api/skin-analysis` history from mobile (that
  endpoint is cookie-session based); consider a mobile-auth variant later.
