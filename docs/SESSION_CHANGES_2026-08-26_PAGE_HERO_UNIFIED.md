# One hero for the information pages, and the logos are gone

Date: 26 Aug 2026

## What was wrong

Eight information pages plus help had each written their opening block by hand, and they
had drifted.

| | hero padding | title | subtitle | ornament |
| --- | --- | --- | --- | --- |
| help | 24/12/20 | pageTitle | body | — |
| about | 20/16/24 | pageTitle | — | **logo** + flag + heart |
| brand | 20/16/24 | **sectionTitle** | — | **logo** + badges |
| partners | 20/12/20 | pageTitle | subtitle | icon tile |
| training | 20/12/20 | pageTitle | subtitle | icon well + stats |
| locations | 20/12/20 | pageTitle | subtitle | flag emoji |
| faq | 24/12/16 | pageTitle | body | — |
| contact | 20/16/24 | pageTitle | — | **logo** + flag + heart |

Four padding combinations, two title sizes, two subtitle sizes. Open two in a row and they
do not look like the same app.

The logo was the loudest part. About, brand and contact each opened with it, repeating on
every page what the header already said and pushing the actual content below the fold.

## What shipped

`components/PageHero.js` — a title, an optional subtitle, and the help page's geometry.
All eight pages plus help now use it. The three logos, the flag emoji, the heart and the
two icon tiles are gone.

Two things stayed, because they are information rather than ornament: brand's *Made in
Korea* and *Certified UAE* badges, and training's counts of guides, products and videos.
Both render inside the hero as children.

About and contact keep the company name as the title with the country as the subtitle —
the same two facts the logo block carried, minus the picture.

Removing the heroes orphaned 41 style blocks and four imports across the eight files;
those went too.

`scripts/smoke-page-shell.js` pins it: every page renders `<PageHero>`, none rebuilds it
with local `heroSection` / `heroTitle` / `heroSubtitle` styles, and no page carries a logo.
Wired into `verify:release`.

## Verification

- Rendered the hero for every case, including Arabic, through react-native-web
- `npm run verify:release` clean
- `expo export --platform ios` bundles clean

## Deliberately not done: the section headings

The obvious next step looks like bringing section headings in line too, since help and
contact label their sections with an eyebrow (`groupHeader`) while about, brand, training,
delivery, partners and locations put an icon and a title inside the card.

I did not, because the eyebrow is the *minority*. `SectionCard` and `SectionHeader` are
shared components used by **twelve** screens — product detail, bag, billing, payment, edit
profile, add-address, terms and order detail among them. Converting the information pages
to eyebrows would leave them matching help and contact but no longer matching the rest of
the app: the seam moves rather than closes.

They may also be two different things rather than one thing done two ways. The eyebrow
labels a *group of rows* — it is what the profile menu itself uses for GENERAL and
INFORMATION. The icon header titles a *card of content*. Worth a decision before 17 call
sites are rewritten.

## Also not done

`delivery.js` has no hero at all. Giving it one means writing new customer-facing copy in
three languages, which is a content decision rather than a layout one.
