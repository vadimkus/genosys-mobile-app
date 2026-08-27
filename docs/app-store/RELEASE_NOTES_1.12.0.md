# Release Notes — Genosys UAE 1.12.0

| Field | Value |
|-------|-------|
| App Name | Genosys UAE |
| Bundle ID | `ae.genosys.app` |
| Version | 1.12.0 |
| iOS build | 105 |
| Android versionCode | 91 |
| Runtime (EAS Update) | 1.12.0 |
| Expo SDK | 57 |
| Prepared | 27 August 2026 |

Previous release: 1.11.0 (iOS build 103, Android versionCode 90), 9 July 2026.
149 commits between them.

---

## What's New in This Version

Character limit is 4000 per localization. Both fit well inside it.

### English

```
The app now looks and reads like genosys.ae, and your order is on the Lock Screen while it travels.

• Live order card — once you place an order, a card appears on your Lock Screen and moves with it: confirmed, shipped, delivered, with the delivery window for your emirate. It updates on its own, without opening the app. Requires iOS 16.2 or later.
• A new look throughout — the typography, colours and cards of our website, carried across every screen. Headers and buttons now float and step out of the way as you read.
• Choose before you buy — size and shade sit above the fold on every product page and in the buy bar itself, and the price follows the quantity as you change it.
• More about each product — in-app product guides, videos, pinch-to-zoom on photos, recommended routines and the same ingredient detail the website carries.
• Partner Portal — professional accounts can order directly in the app, with consignment and credit terms, size selection and one-tap reorder from a recent order.
• Read in your language anywhere — English, العربية and Русский now switch from the product and article screens too, not only the home screen.
• Better search — exact product matches come first, and shades and sizes are searchable.
• Clearer forms — sign-in, profile and address problems are marked on the field that caused them, and a UAE phone number is accepted however you write it.

Plus improved contrast throughout, larger touch targets, and many small refinements.
```

### Русский

```
Приложение теперь выглядит и читается как genosys.ae, а ваш заказ виден на экране блокировки, пока он в пути.

• Живая карточка заказа — после оформления на экране блокировки появляется карточка и меняется вместе с заказом: подтверждён, отправлен, доставлен, со сроком доставки для вашего эмирата. Она обновляется сама, открывать приложение не нужно. Требуется iOS 16.2 или новее.
• Новый облик — типографика, цвета и карточки нашего сайта на каждом экране. Шапка и кнопки теперь «плавают» и уходят с дороги, пока вы читаете.
• Выбор до покупки — размер и оттенок видны сразу на странице товара и в самой панели покупки, а цена меняется вместе с количеством.
• Больше о каждом товаре — руководства и видео прямо в приложении, увеличение фотографий жестом, рекомендованные схемы ухода и тот же состав, что и на сайте.
• Партнёрский портал — профессиональные аккаунты могут заказывать прямо в приложении: консигнация и кредитные условия, выбор размера и повтор заказа в одно касание.
• Язык — где угодно — английский, арабский и русский теперь переключаются и на страницах товара и статьи, а не только на главной.
• Точнее поиск — сначала показываются точные совпадения, а оттенки и размеры тоже участвуют в поиске.
• Понятнее формы — ошибки входа, профиля и адреса отмечаются прямо у того поля, где возникли, а номер ОАЭ принимается в любом написании.

А также улучшенная контрастность, более крупные области нажатия и множество мелких доработок.
```

### Arabic

Not written for this release. The App Store listing carries an `ar` localization,
so leaving it empty makes Apple fall back to the English text for Arabic
customers. Worth adding before submission if the Arabic listing is live.

---

## Notes for App Review

**Demo account** — `appreview@genosys.ae` / `GenosysReview2026!`
Pre-created, no email verification needed. Physical goods, Stripe payments,
no in-app purchases.

**New in this build: a Live Activity.** The order card on the Lock Screen is a
widget extension (`ae.genosys.app.widgets`) and needs no special permission
beyond the system's own "Live Activities" toggle, which is on by default.

To see it:

1. Sign in with the demo account.
2. Add any product to the bag and check out with **Cash on Delivery** — no
   payment details required.
3. Lock the device. The card appears on the Lock Screen showing the order
   number, its status, the delivery window and a three-step tracker.

The card can also be raised and updated by push while the app is closed, over
APNs on the `ae.genosys.app.push-type.liveactivity` topic.

**Permissions and data.** No change from 1.11.0. Notifications remain optional,
and the app functions fully without them.

---

## Contact

| Field | Value |
|-------|-------|
| Marketing URL | https://genosys.ae |
| Support URL | https://genosys.ae |
| Privacy Policy | https://genosys.ae/privacy-policy |
| Support email | sales@genosys.ae |
| Review contact | Vadim Sagatdinov, +971 55 915 2985 |
