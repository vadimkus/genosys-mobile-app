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

## Verdict (confirmed 2026-08-31)

**Done. No action.** Play Console → Android developer verification → Package names:

- **Genosys UAE** / `ae.genosys.app` → **Registered** (green check)
- **Keys:** 1
- **Last updated:** Mar 6, 2026
- Only package on the account

The Sep 30 banner is account-wide boilerplate. This app already meets it.

## Action checklist (manual, Play Console)

1. Open [Play Console Home](https://play.google.com/console).
2. Check package name registration status for `ae.genosys.app`.
3. Filter for **unregistered** apps if the filter is available.
4. Confirm identity under **Settings → Developer account** (usually already done for Play publishers).
5. Skip “outside Play” registration unless you start distributing APKs via other stores.
6. Only add extra signing keys if you sign the same package outside Play with a non-Play key.

## Deadline

**September 30, 2026** — ~8 weeks from this note.

## Re-check 2026-08-31 (final-reminder email)

Same mass mail again, now titled **[Final reminder]**, sent to `f.this.that@gmail.com`.

Live Play listing confirmed (not Console):

| Item | Status 31 Aug |
|---|---|
| Listing | Live: https://play.google.com/store/apps/details?id=ae.genosys.app |
| Publisher | Genosys Middle East FZ-LLC |
| Updated on | **27 Aug 2026** (matches AAB 1.12.0 / versionCode 91) |
| Rating | 4.4 |
| Downloads bucket | **10+** |
| Other Play apps on this repo | None |
| Off-Play store APKs | Still none. Preview/dev APKs in EAS are internal, not Samsung/Huawei/etc. |

Play Console screenshot confirmed **Registered** (1 key, last updated Mar 6, 2026). No further work.

## Sources

- https://developer.android.com/developer-verification/guides/google-play-console
- https://support.google.com/googleplay/android-developer/answer/16984799
