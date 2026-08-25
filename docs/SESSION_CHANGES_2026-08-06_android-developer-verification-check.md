# Android developer verification email check

Date: 2026-08-06

## Context

Google Play sent Vadim a reminder: register apps and signing keys for Android developer verification before **September 30, 2026**, or unregistered Play apps can be removed globally.

## App in scope

| Item | Value |
|------|-------|
| App | Genosys UAE |
| Package | `ae.genosys.app` |
| Distribution | Google Play only (EAS Build + Play App Signing) |
| Off-Play stores | Not used for production distribution |

## Verdict

- Email is a **mass reminder**, not proof Genosys is unregistered.
- Google says **~99% of Play apps were auto-registered** via existing Play signing keys.
- Genosys uses standard Play App Signing with EAS-managed upload key → **very likely already registered**.
- Still must confirm on Play Console Home (package name status next to each app).

## Action checklist (manual, Play Console)

1. Open [Play Console Home](https://play.google.com/console).
2. Check package name registration status for `ae.genosys.app`.
3. Filter for **unregistered** apps if the filter is available.
4. Confirm identity under **Settings → Developer account** (usually already done for Play publishers).
5. Skip “outside Play” registration unless you start distributing APKs via other stores.
6. Only add extra signing keys if you sign the same package outside Play with a non-Play key.

## Deadline

**September 30, 2026** — ~8 weeks from this note.

## Sources

- https://developer.android.com/developer-verification/guides/google-play-console
- https://support.google.com/googleplay/android-developer/answer/16984799
