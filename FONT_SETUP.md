# Century Gothic Font Setup Instructions

To implement Century Gothic typography across the app, follow these steps:

## 1. Add Font Files

You need to obtain the Century Gothic font files and place them in the `assets/fonts/` directory:

```
assets/
└── fonts/
    ├── CenturyGothic.ttf
    ├── CenturyGothic-Bold.ttf
    └── CenturyGothic-Italic.ttf (optional)
```

## 2. Font Files Required

- **CenturyGothic.ttf** - Regular weight
- **CenturyGothic-Bold.ttf** - Bold weight
- **CenturyGothic-Italic.ttf** - Italic weight (optional)

## 3. Link Fonts

The `react-native.config.js` file has been created to link the fonts. Run:

```bash
npx react-native-asset
```

## 4. Typography System

The typography system has been set up in `src/constants/typography.ts` with:

- Font family configuration
- Predefined text styles (h1, h2, h3, h4, body, caption, button)
- Font size scale
- Font weight options
- Line height configurations

## 5. Usage

### Using Predefined Styles

```typescript
import { typography } from '../constants/typography';

const styles = StyleSheet.create({
  title: {
    ...typography.styles.h1,
    color: '#000000',
  },
  body: {
    ...typography.styles.body,
    color: '#666666',
  },
});
```

### Using Theme Context

```typescript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <Text style={[theme.typography.styles.h2, { color: theme.colors.text }]}>
      My Title
    </Text>
  );
};
```

### Direct Font Family

```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Century Gothic',
    fontSize: 16,
    fontWeight: '400',
  },
});
```

## 6. Font Characteristics

Century Gothic is a geometric sans-serif typeface with:
- Clean, modern appearance
- Excellent readability
- Professional look
- Good for both headings and body text

## 7. Testing

After adding the font files and running the linking command:

1. Test on both iOS and Android
2. Verify all text elements use Century Gothic
3. Check different font weights (regular, bold)
4. Ensure proper rendering across different screen sizes

## 8. Fallback

If Century Gothic is not available, the system will fall back to the default system font. The typography system includes fallback handling in the `getFontFamily` helper function.

## 9. Performance

- Custom fonts increase app bundle size
- Consider using font subsets if file size is a concern
- Test app performance after font integration

## 10. Current Implementation

The following components have been updated to use Century Gothic:
- HomeScreen header subtitle
- Theme context integration
- Typography constants system

Additional components can be updated by importing the typography system and applying the font family to text styles.
