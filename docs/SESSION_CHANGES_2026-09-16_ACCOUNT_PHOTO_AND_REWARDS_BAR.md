# Account photo and rewards bar

Date: 16 Sep 2026

Physical screenshot of Account showed a generic person silhouette and a hairline
where the Silver → Gold spend bar should be.

## Profile photo

Session restore replaced the stored user with the validate payload. An empty
`profilePicture` on that payload wiped a photo that was already on the device.
Relative paths also never became a loadable URI.

Account and Edit Profile now resolve `https`, `data:`, `file:`, and site-relative
paths, render through `expo-image`, and keep the last good photo when the server
sends none. A failed load falls back to the initial on the rose disc.

## Rewards bar

Silver can be earned by order count while spend is still below AED 1,000. The
API then sent a negative percent, the client clamped it to 0, and the fill
disappeared. AED 432 toward Gold at AED 5,000 now reads as about 9% and never
thinner than a 12-point chip. The track is the cream separator; the fill is rose.

`scripts/smoke-account-profile.js` pins both behaviours.

## Shipping

OTA, iOS, runtimes 1.12.0 and 1.13.0. Open the app twice, then Account.
