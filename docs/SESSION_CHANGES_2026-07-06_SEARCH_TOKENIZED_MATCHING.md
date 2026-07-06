# Session Changes — Shop Search: Tokenized Matching (2026-07-06)

Part of the cross-platform search audit (full write-up:
`cosmetics-website/docs/SESSION_CHANGES_2026-07-06_SEARCH_AUDIT_FIXES.md`).

## Change

`app/(tabs)/shop.js` — search filter rewritten:

- **Tokenized AND matching**: every query word must appear somewhere in the
  product's searchable text, so word order no longer matters
  ("serum hyaluron" now finds "HYALURON SERUM"; before it returned nothing).
- **Proper accent folding**: normalization now strips Latin combining
  diacritics and Arabic harakat after NFKD (previously NFKD alone did
  nothing useful).
- **All-locale haystack**: EN/RU/AR names and descriptions are searchable
  regardless of the active app language (previously only the active locale +
  English).

## Deploy

JS-only change — OTA-safe via EAS Update. No native rebuild required.
