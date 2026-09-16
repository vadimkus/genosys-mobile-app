# Checkout stale variant guard

**Date:** 16 September 2026
**Delivery:** JavaScript-only OTA for runtimes 1.12.0 and 1.13.0

## Customer report

Checkout blocked card payment with `Selection required` for:

- MICROBIOME ENERGY INFUSING MIST
- EyeCell EYE PEPTIDE GEL PATCH
- SOOTHING BOMB SEA ALGAE MASK

None of those products has a selectable size or colour.

## Root cause

The customer's persisted cart contained older product snapshots with
`hasVariants=true` but no actual `variants` or `colorVariants`. The current
live API correctly returns `hasVariants=false` and empty option arrays for all
three products.

The checkout guard intentionally treated `hasVariants=true` plus missing
option data as unsafe. That protects real size/shade products when a reduced
or stale payload loses its options, but it also created this false positive
for old simple-product snapshots.

## Fix

Before option validation, checkout now refreshes only ambiguous cart lines
from the canonical single-product API:

- Canonical simple products proceed without a false selection prompt.
- Real size/shade products still require a valid explicit choice.
- If refresh fails, the existing fail-closed behavior remains.
- Normal cart lines with complete option data make no extra API request.

## Verification

- Production database confirms all three products have only size-less,
  colour-less default records.
- Production mobile API confirms `hasVariants=false`, `variants=[]`, and
  `colorVariants=[]` for products 14, 33, and 36.
- Product-option smoke passed, including stale-simple refresh coverage.
- Full ESLint, label-case, and no-dash checks passed.
- iOS and Android exports passed.
- Full `verify:release` and `expo-doctor` 20 of 20 passed.

## Production OTA

Runtime 1.13.0:

- Update group: `52cf5996-b8ab-4620-9878-b60350df5242`.
- Android: `01a0a949-8881-764f-86ad-85a60656ac64`.
- iOS: `01a0a949-8881-7c20-a6ac-0fcb7262e364`.

Runtime 1.12.0 compatibility release for currently installed store builds:

- Update group: `302aa643-1ae9-4bab-a966-a054681d7b31`.
- Android: `01a0a94a-ada7-79a0-9df1-d02d3189478c`.
- iOS: `01a0a94a-ada7-7412-9e0e-12f03294534b`.

Both releases target the production branch on iOS and Android. The repository
runtime was restored to 1.13.0 after publishing the compatibility update.

## Bundle Builder follow-up

A customer could still reproduce the alert after building a set in the native
Bundle Builder. Its reduced product object omitted `hasVariants`; when that
object merged into an older bundle line, the old `hasVariants=true` survived.

The Bundle Builder now writes `hasVariants` explicitly from its selectable
variants. Checkout also refreshes every Bundle Builder line from the canonical
product API before option validation, using product number first and database
id as fallback. This clears stale flags for simple products while still
blocking a real multi-size or multi-shade product without a valid selection.
