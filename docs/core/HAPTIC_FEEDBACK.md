# Haptic Feedback

## Overview

Light haptic feedback has been added to key user interactions using `expo-haptics`. This makes the app feel premium and responsive, providing tactile confirmation for important actions like adding items to the bag, toggling favorites, and placing orders.

---

## Haptic Types Used

| Function | Haptic Type | Feel | Used For |
|---|---|---|---|
| `lightTap()` | Impact Light | Subtle tap | Favorite toggle, minor selections |
| `mediumTap()` | Impact Medium | Noticeable tap | Checkout submit button press |
| `selectionTick()` | Selection | Tiny click | Category filter switch |
| `success()` | Notification Success | Satisfying double-tap | Add to bag, order placed |
| `warning()` | Notification Warning | Alert buzz | Form validation errors |
| `error()` | Notification Error | Strong alert | Failed actions (available, not yet wired) |

---

## Integration Points

### Shop Screen (`app/(tabs)/shop.js`)

| Action | Haptic | Why |
|---|---|---|
| Add to bag (grid) | `success()` | Confirms item was added |
| Toggle favorite (heart) | `lightTap()` | Subtle feedback on toggle |
| Category tab switch | `selectionTick()` | Selection change feedback |

### Product Detail (`app/product/[id].js`)

| Action | Haptic | Why |
|---|---|---|
| Add to bag | `success()` | Confirms item was added |
| Wishlist toggle | `lightTap()` | Subtle feedback on toggle |

### Checkout (`app/checkout.js`)

| Action | Haptic | Why |
|---|---|---|
| Submit button press | `mediumTap()` | Acknowledges action |
| Validation error | `warning()` | Alerts user to fix fields |
| Order placed (COD) | `success()` | Celebrates successful order |

---

## Implementation

### Utility Module: `utils/haptics.js`

All haptic calls go through a safe wrapper that catches errors silently. This ensures:
- No crashes on iOS Simulator (haptics unavailable)
- No crashes in Expo Go on Android
- No crashes on devices without haptic hardware
- Graceful degradation on all platforms

```javascript
import * as haptics from '../utils/haptics';

// In your component:
haptics.success();      // Add to bag
haptics.lightTap();     // Toggle favorite
haptics.selectionTick(); // Category switch
haptics.warning();      // Validation error
haptics.mediumTap();    // Button press
```

### Available Functions

```javascript
lightTap()       // ImpactFeedbackStyle.Light
mediumTap()      // ImpactFeedbackStyle.Medium
heavyTap()       // ImpactFeedbackStyle.Heavy
success()        // NotificationFeedbackType.Success
warning()        // NotificationFeedbackType.Warning
error()          // NotificationFeedbackType.Error
selectionTick()  // selectionAsync()
```

---

## Platform Notes

| Platform | Behavior |
|---|---|
| iPhone (physical) | Full haptic engine support |
| iOS Simulator | No haptics (silently skipped) |
| Android (with vibration motor) | Vibration-based haptics |
| Android (no motor) | Silently skipped |
| Expo Go (iOS) | Works on physical devices |
| Expo Go (Android) | May not work (silently skipped) |

---

## Guidelines for Adding New Haptics

1. **Use sparingly**: Only on meaningful user actions, not on every tap
2. **Match intensity to importance**: `lightTap` for minor, `success` for significant
3. **Never block on haptics**: All calls are fire-and-forget
4. **Test on physical device**: Simulator/emulator cannot reproduce haptic feel
5. **Don't use for scrolling or passive events**: Only for active user decisions
