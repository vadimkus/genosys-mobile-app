# App Footer Gold Frame OTA

Date: 2026-07-26

## Goal

Premium gold footer matching website certificate language, without the
continuous Reanimated shimmer that froze Account scroll.

## Design (web-informed)

From `CertificateClient.tsx` gold treatment:
- Full gold outer rim + inset hairline (double frame)
- Static gold gradient top bar (`#B8860B` → `#D4AF37` → `#F9E79F`)
- Corner ornaments
- White wordmark; gold on tagline / links only
- Soft static gold shadow (no animation loop)

## Interaction

- Whole card pressable → `https://www.genosys.ae` + medium haptic
- Nested website / email links keep their own targets + haptic
- Press opacity/scale feedback only (no continuous motion)

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- (group filled after publish)
