# Release Notes, Genosys UAE 1.12.0

| Field | Value |
|-------|-------|
| App name | Genosys UAE |
| Bundle ID | `ae.genosys.app` |
| Version | 1.12.0 |
| iOS build | 106 |
| Android versionCode | 91 |
| Previous release | 1.11.0, 9 July 2026 |
| Lock Screen order card | Requires iOS 16.2 or later |

---

## What's New in This Version

### English

```
The app now looks and reads like genosys.ae, and your order sits on the Lock Screen while it travels.

• Live order card. Once you place an order a card appears on your Lock Screen and moves with it: confirmed, shipped, delivered, with the delivery window for your emirate. It updates on its own, without opening the app. Requires iOS 16.2 or later.
• A new look throughout. The typography, colours and cards of our website, carried across every screen. Headers and buttons now float and step out of the way as you read.
• Choose before you buy. Size and shade sit above the fold on every product page and in the buy bar itself, and the price follows the quantity as you change it.
• More about each product. In-app guides, videos, pinch to zoom on photos, recommended routines and the same ingredient detail the website carries.
• Partner Portal. Professional accounts can order directly in the app, with consignment and credit terms, size selection and one-tap reorder from a recent order.
• Read in your language anywhere. English, العربية and Русский now switch from the product and article screens too, not only the home screen.
• Better search. Exact product matches come first, and shades and sizes are searchable.
• Clearer forms. Sign-in, profile and address problems are marked on the field that caused them, and a UAE phone number is accepted however you write it.

Plus improved contrast throughout, larger touch targets, and many small refinements.
```

### Русский

```
Приложение теперь выглядит и читается как genosys.ae, а ваш заказ виден на экране блокировки, пока он в пути.

• Живая карточка заказа. После оформления на экране блокировки появляется карточка и меняется вместе с заказом: подтверждён, отправлен, доставлен, со сроком доставки для вашего эмирата. Она обновляется сама, открывать приложение не нужно. Требуется iOS 16.2 или новее.
• Новый облик. Типографика, цвета и карточки нашего сайта на каждом экране. Шапка и кнопки теперь плавают и уходят с дороги, пока вы читаете.
• Выбор до покупки. Размер и оттенок видны сразу на странице товара и в самой панели покупки, а цена меняется вместе с количеством.
• Больше о каждом товаре. Руководства и видео прямо в приложении, увеличение фотографий жестом, рекомендованные схемы ухода и тот же состав, что и на сайте.
• Партнёрский портал. Профессиональные аккаунты могут заказывать прямо в приложении: консигнация и кредитные условия, выбор размера и повтор заказа в одно касание.
• Язык где угодно. Английский, арабский и русский теперь переключаются и на страницах товара и статьи, а не только на главной.
• Точнее поиск. Сначала показываются точные совпадения, а оттенки и размеры тоже участвуют в поиске.
• Понятнее формы. Ошибки входа, профиля и адреса отмечаются прямо у того поля, где возникли, а номер ОАЭ принимается в любом написании.

А также улучшенная контрастность, более крупные области нажатия и множество мелких доработок.
```

---

## Notes for App Review

**Test account:** `appreview@genosys.ae` / `GenosysReview2026!`

Pre-created, no email verification needed. Physical goods, Stripe payments, no
in-app purchases.

### New in this build: a Live Activity

The order card on the Lock Screen is a widget extension
(`ae.genosys.app.widgets`). It requires no permission prompt beyond the system's
own Live Activities setting, which is enabled by default.

To see it:

1. Sign in with the test account.
2. Add any product to the bag and check out choosing Cash on Delivery. No payment
   details are needed for this path.
3. Lock the device. The card appears on the Lock Screen showing the order number,
   its current status, the delivery window for the chosen emirate, and a three
   step tracker.

The card is also raised and updated by push while the app is closed, over APNs on
the `ae.genosys.app.push-type.liveactivity` topic. On iOS earlier than 16.2 the
feature is absent and the app behaves as 1.11.0 did.

### Permissions and data

Unchanged from 1.11.0. Push notifications remain optional and the app is fully
functional without them. No new data is collected.

---

## Contact

| Field | Value |
|-------|-------|
| Marketing | https://genosys.ae |
| Support | https://genosys.ae |
| Privacy policy | https://genosys.ae/privacy-policy |
| Support email | sales@genosys.ae |
| Review contact | Vadim Sagatdinov, +971 55 915 2985 |

---

## Open item

The App Store listing carries an `ar` localization. No Arabic What's New text has
been written for this release, so Apple will show the English text to Arabic
customers until one is added.
