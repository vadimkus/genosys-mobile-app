# Chatbot ("Genie")

## Overview

The native app includes an AI-powered chatbot called **Genie** — the GENOSYS Beauty Genie. It provides personalised skincare recommendations, product information, and customer support. The implementation mirrors the mobile web `ChatWidget` component.

## Architecture

```
┌──────────────────┐     POST /api/chat      ┌───────────────────┐
│  Native App      │ ─────────────────────► │  genosys.ae       │
│  (chat.js)       │                         │  (Next.js API)    │
│                  │ ◄───── SSE stream ───── │                   │
│  chatService.js  │   text-delta chunks     │  OpenAI / AI SDK  │
└──────────────────┘                         └───────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `app/chat.js` | Full-screen chat UI |
| `components/ChatButton.js` | Floating button (bottom-right, above tab bar) |
| `services/chatService.js` | API client — sends messages, parses SSE response |
| `app/AuthWrapper.js` | Controls ChatButton visibility (hides on certain routes) |

## Features

### Contextual Welcome Message

When the chat opens, Genie greets the user with a time-aware and context-aware message:

| Time | Greeting |
|------|----------|
| 5am–12pm | "Good morning! ☀️" |
| 12pm–5pm | "Good afternoon! ✨" |
| 5pm–9pm | "Good evening! 🌙" |
| 9pm–5am | "Good night! 💫" |

Additional context lines are appended based on:
- **Weekend** (Fri/Sat in UAE): "Happy weekend! 🎉"
- **Morning**: "Starting your day with great skincare!"
- **Afternoon**: "Perfect time for a skincare check-in!"
- **Evening**: "Time for your evening skincare routine!"
- **Night**: "Late-night skincare shopping? We love it! 🌟"

Implementation: `getUserContext()` and `buildWelcome()` functions in `app/chat.js`.

### Quick Action Buttons

After the welcome message, 10 quick action buttons are displayed in 3 rows:

**Row 1 — Skin Types:**
- 💧 Dry Skin → "What products do you recommend for dry skin?"
- 🧴 Oily Skin → "Best products for oily skin?"
- ✨ Anti-Aging → "What are your best anti-aging products?"
- 🪞 Glass Skin → "How can I achieve glass skin?"

**Row 2 — Concerns & Info:**
- 🌿 Acne → "Best products for acne-prone skin?"
- 📋 Routine → "Can you suggest a complete skincare routine?"
- 🏆 Why GENOSYS → "What makes GENOSYS products special?"
- ☀️ Sun Protection → "Best sun protection products?"

**Row 3 — Highlights (red background):**
- 🎁 Discount → "Are there any current discounts or offers?"
- 📸 AI Skin Analysis → "How does your AI skin analysis work?"

All labels and queries are internationalised (EN, AR, RU) via `i18n/messages/*.json` under `chat.*` keys.

### Product Cards

When Genie mentions a product, the response contains `{{id:NUMBER}}` placeholders. The app:
1. Parses these with `segmentChatResponse()` from `chatService.js`
2. Fetches product data via `fetchProductById()`
3. Renders inline product cards with image, name, price
4. Each card has **Add to Bag** and **View Product** buttons

### Multi-language Support

The chatbot sends `locale` and `context` in the API request body, allowing the backend AI to respond in the user's language. Supported: English, Arabic (RTL), Russian.

## API Integration

### Request Format

```javascript
POST https://genosys.ae/api/chat

Headers:
  Content-Type: application/json
  Accept: text/plain, application/json
  x-locale: en|ar|ru

Body:
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "locale": "en",
  "context": {
    "timeOfDay": "afternoon",
    "dayOfWeek": "Saturday",
    "isWeekend": true,
    "localTime": "14:30",
    "timezone": "Asia/Dubai"
  },
  "chatId": "chat_1707300000000_abc1234"
}
```

### Response Format (AI SDK v6 SSE)

The API returns a Server-Sent Events stream:

```
data: {"type":"start"}
data: {"type":"start-step"}
data: {"type":"text-start","id":"msg_..."}
data: {"type":"text-delta","id":"msg_...","delta":"Hello"}
data: {"type":"text-delta","id":"msg_...","delta":" there!"}
data: {"type":"text-end","id":"msg_..."}
data: {"type":"finish-step"}
data: {"type":"finish","finishReason":"stop"}
data: [DONE]
```

The `chatService.js` parser:
1. Reads the full response body as text
2. Splits by newline and processes each `data: ` line
3. Extracts `delta` values from `text-delta` events
4. Joins all deltas to produce the final response string
5. Also supports the legacy `0:"text"` format as a fallback

### Rate Limiting

If the API returns HTTP 429, the service returns `'__RATE_LIMITED__'` and the UI shows a rate-limit message.

### Session Tracking

A unique `chatId` is generated once per app session (`chat_<timestamp>_<random>`) and sent with every request to maintain conversation context on the backend.

## UI Layout

```
┌─────────────────────────┐
│  ← Genie ✨              │  ← Red header (#dc2626)
│    Your Beauty Advisor   │
├─────────────────────────┤
│                         │
│  🤖 Welcome message     │  ← Assistant bubble (white)
│                         │
│  [💧 Dry] [🧴 Oily]     │  ← Quick action buttons
│  [✨ Anti] [🪞 Glass]    │
│  [🌿 Acne] [📋 Routine] │
│  [🏆 Why] [☀️ Sun]      │
│  [🎁 Discount] [📸 AI]  │  ← Highlighted (red bg)
│                         │
│        User message  →  │  ← User bubble (red)
│                         │
│  🤖 Genie response      │
│  ┌─────────────────┐    │
│  │ Product Card     │    │  ← Inline product card
│  │ [Add] [View]     │    │
│  └─────────────────┘    │
│                         │
├─────────────────────────┤
│  [Type a message...] [→]│  ← Input bar
└─────────────────────────┘
```

### Safe Area Handling

- `SafeAreaView` with `edges={['top', 'bottom']}` ensures content doesn't overlap with the notch or home indicator
- `KeyboardAvoidingView` with `behavior="padding"` (iOS) keeps the input bar visible above the keyboard
- `keyboardVerticalOffset` adjusted for the bottom safe area inset

## Floating Chat Button

The `ChatButton` component renders a red circular button (56px) in the bottom-right corner with:
- `chatbubble-ellipses` icon (matches web's MessageCircle)
- Green notification dot (12px, top-right corner)
- Positioned above the tab bar (`bottom: 100` on iOS, `72` on Android)

### Visibility

The button is hidden on certain routes (defined in `AuthWrapper.js`):
- `/chat` (already in chat)
- `/skin-analysis-camera`
- `/checkout`
- `/auth/` (login/register)
- `/webview`
- `/payment/`
- `/profile`

## i18n Keys

All chatbot text is internationalised under the `chat.*` namespace in:
- `i18n/messages/en.json`
- `i18n/messages/ar.json`
- `i18n/messages/ru.json`

Key groups:
- `chat.title`, `chat.subtitle` — Header text
- `chat.greetingMorning/Afternoon/Evening/Night` — Time-based greetings
- `chat.contextMorning/Afternoon/Evening/Night/Weekend` — Context lines
- `chat.welcome` — Main welcome body
- `chat.quickDrySkin`, `chat.quickDrySkinQuery`, etc. — Quick action labels + queries
- `chat.placeholder`, `chat.thinking`, `chat.errorMessage`, `chat.rateLimited` — UI strings
- `chat.addToBag`, `chat.added`, `chat.viewProduct` — Product card buttons
