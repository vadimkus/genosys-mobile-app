# Session Changes — 2026-06-12: iOS 1.10.2 (build 88) App Store Submission

## Context

After the iOS audit and Universal Links fix, version 1.10.2 (build 88) was uploaded to TestFlight, tested by Vadim ("looking good"), and submitted to App Store review on **June 12, 2026**.

## What was submitted

- **Version:** 1.10.2 (build 88)
- **Key changes in this release:**
  - iOS Universal Links — associated-domains entitlement (`applinks:genosys.ae`) + AASA file live on genosys.ae
  - Clarified camera usage description (skin-analysis feature)
  - Performance/stability improvements, removed unused frameworks

## App Store Connect metadata used

- **Promotional Text:** "Authentic GENOSYS Korean dermacosmetics in the UAE. Shop serums, SPF, masks and professional devices with fast local delivery and secure checkout."
- **Description:** rewritten full description (~1,600 chars) — sections: Shop Professional Korean Skincare / Easy and Secure Shopping / Made for the UAE / Authentic, Always. PDF copy archived (see below).
- **App Review sign-in:** `appreview@genosys.ae` (password set in App Store Connect; account verified working on production genosys.ae on Jun 12 — login redirects to /products with valid session)
- **Contact:** Vadim Sagatdinov, +971 55 915 2985
- **Attachment:** `Genosys_App_Review_Notes_1.10.2.pdf` (created on Desktop) — app overview, demo credentials, step-by-step reviewer test instructions (browse, login, cart/checkout stop-at-Stripe note, favorites, Universal Links, skin analysis, EN/AR/RU), what's new, contact info.

## Verification done before submission

- Demo account login tested live on https://genosys.ae/login via browser — successful (user id `cmlcj4goc002kebk0v5idsi4p`).
- Reviewer notes PDF generated via headless Chrome from HTML and placed at `~/Desktop/Genosys_App_Review_Notes_1.10.2.pdf`.

## Status

- **Submitted to App Review: 2026-06-12** — awaiting review (typical 1–3 days).

## If rejected

- Check Resolution Center first; metadata issues can be fixed without a new build.
- Demo login already verified working, so credential rejection is unlikely.
