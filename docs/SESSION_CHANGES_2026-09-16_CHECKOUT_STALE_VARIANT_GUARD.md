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
