# Android 1.12.0 (versionCode 91)

Date: 27 Aug 2026

Artifact: `~/Desktop/Genosys-UAE-1.12.0-91.aab` (107 MB)
Build: `d42698c3-0f02-4b9e-8bd9-3eb227e027ea`

## Why this build matters more than it looks

Android's live binary on Play was **1.11.0 / versionCode 90**, built 8 July.
The version went to 1.12.0 on 26 Aug, and runtime versions have to match for
an OTA to be accepted — so **every update published since 26 Aug reached no
Android device at all.** That includes the ones published to `--platform
android`: the update exists, but no installed binary is on runtime 1.12.0 to
consume it.

This was stated wrongly earlier the same day ("Android is up to date, the
Live Activity code just no-ops there"). The no-op part was right. The up to
date part was not.

**Check the shipped binary's runtime, not the branch, before concluding a
platform is current.**

## No version bump

Deliberately still 1.12.0. Bumping to 1.12.1 would move the runtime and strand
iOS build 105, which is on 1.12.0 and has been receiving today's work by OTA
all day. versionCode goes 90 → 91; 91 was allocated in `app.json` earlier and
never built.

After this is live, both platforms sit on runtime 1.12.0 and a single
`eas update` reaches both.

## What Android gains

Everything published since 26 Aug, which is a month of work plus today's:

- Three-step order tracker with the cash-on-delivery rule
- Unified page heroes across the information screens
- The notification-tap routing and status-push handling
- Rewritten order push notification copy — title, subtitle and body, no
  emoji, correct order-number prefix per language
- The Live Activity work, which no-ops here (see `LIVE_ACTIVITY_ANDROID.md`)

## Verification

`sync:runtime` clean, typecheck clean, `verify:release` clean before building.

The artifact was unpacked and the embedded Hermes bundle checked for today's
code and copy:

| | |
| --- | --- |
| `activityOrderLabel`, `activityEtaDubai/Other`, `activityTierLabel` | present |
| `Arriving in {place} within 1–2 hours` | present |
| `доставим за 1`, `يصل خلال` | present |
| `watchActivityToken`, `pruneDuplicates`, `adoptRunningCard` | present |
| runtime in `resources.pb` | 1.12.0 |
| versionCode | 91 |

**A plain ASCII grep of a Hermes bundle under-reports.** Any string containing
a non-ASCII character — an en dash is enough — is stored UTF-16 in the string
table, so `grep "Arriving in"` returns nothing for a string that is present.
Search both encodings or you will chase a phantom.

## Upload

Play Console → Production (or Internal testing) → upload the `.aab`.

## iOS

Not rebuilt, and does not need to be. Build 105 is 1.12.0 on TestFlight and
already has all of today's work through OTA. A new iOS binary is only needed
to promote 1.12.0 from TestFlight to the App Store, which is a release
decision rather than a build one.
