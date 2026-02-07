# Animations

## Overview

Decorative animations across the native app have been removed to improve performance, reduce battery usage, and provide a cleaner user experience. Only functional, scroll-based header animations are retained.

## What Was Removed

### Shop Page (`app/(tabs)/shop.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Card entrance | Fade-in + slide-up when product cards first appear | Removed |
| Card float/pulse | Continuous looping float (translateY) and scale pulse on cards | Removed |
| Category pill pulse | Subtle scale pulse on category filter buttons | Removed |
| Heart pulse | Scale pulse on favorite heart icons (cards + header) | Removed |
| Subtitle shimmer | Sweeping shimmer highlight on header subtitle text | Removed |
| Subtitle breath | Subtle opacity + translateY breathing on subtitle text | Removed |

**Removed code:**
- `categoryPulse`, `heartPulse` animated values and their `Animated.loop` effects
- `subtitleShine`, `subtitleBreath` animated values and their loop effects
- `cardAnimRef` map storing per-card animation values
- `startFloatLoop()` and `getCardAnim()` helper functions
- Three animation `useEffect` hooks (card toggle, category+heart pulse, subtitle shimmer)
- `useAnimation` context usage (the `animationsEnabled` toggle)
- `Animated.View` wrappers replaced with plain `View` on categories, hearts, and product cards
- `Animated.Text` replaced with plain `Text` on subtitle
- `Animated`, `Easing` removed from react-native imports

### Chat Button (`components/ChatButton.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Scale + fade entrance | Spring scale from 0 to 1 + opacity fade on mount | Removed |
| Scale + fade exit | Timing scale to 0 + opacity to 0 when hiding | Removed |

**Changes:**
- `Animated.View` wrapper replaced with plain `View`
- `Animated`, `useEffect`, `useRef` removed from imports
- Button now renders immediately without entrance animation

### Contact Page (`app/profile/contact.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Heart pulse | Scale 1 -> 1.18 -> 1 + opacity 0.9 -> 1 -> 0.9 every ~4 seconds | Removed |

**Changes:**
- `Animated.View` around heart icon replaced with plain `View`
- `Animated.loop` setup and `heartScale`/`heartOpacity` refs removed
- `Animated`, `Easing`, `useEffect`, `useRef` removed from imports

### About Page (`app/profile/about.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Heart pulse | Same as contact page (scale + opacity loop every ~4s) | Removed |

**Changes:** Identical to contact page cleanup.

## What Is Retained

### Bag Page Header (`app/(tabs)/bag.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Scroll-based header collapse | Header slides up (translateY) as user scrolls down | Kept |

This is a functional UX animation that improves screen space usage while scrolling through the cart. It uses `Animated.FlatList` with `Animated.event` for scroll tracking and interpolates the header's `translateY`.

### Skeleton Loader (`components/SkeletonLoader.js`)

| Animation | Description | Status |
|-----------|-------------|--------|
| Shimmer loading pulse | Opacity 0.3 -> 1 -> 0.3 loop on skeleton placeholder bars | Kept |

This is a functional loading indicator, not a decorative animation.

### Image Transitions

| Location | Description | Status |
|----------|-------------|--------|
| `expo-image` `transition` prop | 200-300ms fade transition when images load | Kept |

These are built into the `expo-image` component and provide smooth image loading.

## Animation Context

The `AnimationContext` (`contexts/AnimationContext.js`) still exists in the codebase but is no longer imported or used by any screen. It can be removed in a future cleanup if desired.

## Files Modified

- `app/(tabs)/shop.js` - All decorative animations removed
- `components/ChatButton.js` - Entrance animation removed
- `app/profile/contact.js` - Heart pulse removed
- `app/profile/about.js` - Heart pulse removed
