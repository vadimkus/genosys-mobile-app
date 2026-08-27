# Two cards for one order

Date: 27 Aug 2026

Confirming an order produced a second Lock Screen card beside the first. The
old one sat frozen on "Waiting to be confirmed" while the new one showed
"We are preparing your order" — the same order, disagreeing with itself.

## The cause: a token we asked for too early

Two things can raise a card: the app, at checkout, and the server, by
push-to-start. The server only raises one when it has no per-activity token for
the order, because a token means a card already exists and should be updated
instead.

The app was never delivering that token.

```js
const token = await instance.getPushToken()   // null, every time
if (token) await send(...)                     // so this never ran
```

`getPushToken()` returns null when the token "is not yet available", and it is
never available in the moment an activity starts — ActivityKit issues it
asynchronously, a beat later. Asking once and giving up meant the server never
learned it, so on the next status change it saw an order with no card and
raised its own.

It is now a subscription — `addPushTokenListener` — which also catches the
token being reissued. It still asks as well, because an adopted card may have
had its token issued long before we started watching.

## The deeper fault: two owners, one screen

Even with the token fixed, the app was replacing any card it did not recognise:
on restart it lost its handle, called `retireStrays`, and raised a fresh one.
That orphaned the token the server was updating through, so the server would
raise another. Two owners taking turns is how one card becomes three.

Two changes:

**Adopt, do not replace.** If a card is already on screen, take it over and
update it. `getInstances()` is the only honest answer to "is there a card?",
since a module variable dies with the process and the server's card was never
in it.

**Prune on every sync.** `getId()` is ActivityKit's own identifier, so anything
running that is not the card being held gets ended — including on the path
where the app simply updates a card it was already holding, which is otherwise
blind to a duplicate raised while it was closed.

## What was considered and not done

Making the server the only owner would be cleaner: one starter, no race. It was
not done because the per-activity token can only be obtained by the app, so the
app has to stay in the loop regardless, and a customer whose push-to-start
token never registered would get no card at all instead of a local one.

The remaining race is narrow: an order confirmed in the second between checkout
and the token arriving. `pruneDuplicates` cleans that up the next time the app
opens rather than preventing it.

## Verification

Typecheck clean, `verify:release` clean. The duplicate on a device clears on the
next orders sync after the update.
