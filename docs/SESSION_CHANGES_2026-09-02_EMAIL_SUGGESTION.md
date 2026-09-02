# The server's email suggestion now drives a tap

**Date:** 2 September 2026

## What was wrong

When registration is refused for a misspelt domain, the API replies with the
address it believes was meant:

```json
{ "success": false,
  "error": "Please check your email address. Did you mean ...@gmail.com?",
  "code": "EMAIL_DOMAIN_SUGGESTION",
  "suggestedEmail": "...@gmail.com" }
```

`AuthContext.register` forwarded only `success` and `error`. The sentence reached
the user, the correction did not, so they were left re-reading their own typo in
a form-wide error banner sitting away from the field it was about.

The screen already has the affordance. It was built for the app's own local
check, which runs the same correction logic before submitting, and normally
catches the typo first. That is why this never surfaced. It would surface if the
two copies drifted: the app would accept an address the server kept refusing, and
the user would have no way through except to guess what the server wanted.

## The fix

`AuthContext.register` passes `code` and `suggestedEmail` through on failure.

`app/auth/login.js` holds the server's answer as `{ forEmail, suggested }`, keyed
by the address it was given for, so editing the field drops a stale suggestion
rather than leaving one pointing at an address that is no longer there. The
existing suggestion strip reads the local check first and falls back to this. The
refusal is written under the email field rather than into the form-wide error, and
focus returns to the field.

Both buttons then behave as they already did:

- **Use suggested** replaces the address, and the retry passes.
- **Keep entered** records the confirmation, which sends
  `emailSuggestionConfirmed: true`, and the server accepts the original.

Cleared on mode toggle with the rest of the form state.

## Verification

Against production:

- a misspelt domain returns `EMAIL_DOMAIN_SUGGESTION` with `suggestedEmail`, the
  shape now consumed;
- the same address with `emailSuggestionConfirmed: true` clears the email gate and
  fails on the next rule instead, so **Keep entered** genuinely breaks the loop.
  Probed with a short password so no account was created.

Note that `EMAIL_DOMAIN_INVALID`, an undeliverable domain, carries no suggestion
and is not overridable by confirming. It falls through to the form-wide error as
before, which is correct: there is nothing to offer and nothing to confirm.

Shipped over the air; no native change.
