# Product review authentication OTA

**Date:** 21 August 2026  
**Runtime:** 1.11.0  
**Platforms:** iOS and Android

## Root cause

The native product review form called the website review endpoint without the
browser CSRF cookie/header pair. The server rejected create, edit and delete
requests with HTTP 403 before review persistence.

## Fix

- Product review mutations now send the app API key and signed user JWT.
- Requests use the shared authenticated HTTP client, including token refresh.
- Delete no longer puts the user's email in the URL.
- The deployed website derives native identity from the signed JWT while
  retaining CSRF protection for browser review submissions.

## Verification

- Mobile TypeScript check: passed.
- iOS Expo export: passed.
- Android Expo export: passed.
- Website review-authentication tests: 3 passed.
- Website production build: passed.
- Live public review GET: HTTP 200.
- Live website CSRF path reached user validation correctly.
- Live native path reached mobile authentication correctly.

## Deployment

- Website commit: `a7ab2d55`
- Mobile commit: `ec9708cffb265844328e9f434803a60fbd1bb63c`
- OTA branch: `production`
- Runtime: `1.11.0`
- Update group: `e7e18589-4890-4287-86de-2881034209ef`
- Android update: `01a02404-4223-795f-9b07-a1b57a718e13`
- iOS update: `01a02404-4223-7b9c-978c-2f95793f2281`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/e7e18589-4890-4287-86de-2881034209ef

The unrelated Android developer-verification session document already present
in the worktree was not committed.
