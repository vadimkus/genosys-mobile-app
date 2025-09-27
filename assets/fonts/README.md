# Font Installation Guide

## ✅ Pretendard Font Installation - COMPLETED

### ✅ Installation Status
- **Font Files Downloaded**: ✅ All 4 variants (Regular, Medium, SemiBold, Bold)
- **File Format**: TTF (compatible with React Native)
- **File Sizes**: ~293KB each (proper font files)
- **Location**: `assets/fonts/` directory
- **Configuration**: Updated `app.json` with `assetBundlePatterns`

### 📁 Downloaded Font Files
- ✅ Pretendard-Regular.ttf (293,667 bytes)
- ✅ Pretendard-Medium.ttf (293,654 bytes)  
- ✅ Pretendard-SemiBold.ttf (293,678 bytes)
- ✅ Pretendard-Bold.ttf (293,631 bytes)

### 🔧 Configuration Applied
- ✅ `app.json` updated with font bundle patterns
- ✅ Font constants created in `src/constants/fonts.ts`
- ✅ HomeScreen updated to use Pretendard fonts
- ✅ Typography system configured

### 💻 Usage in React Native
```javascript
import { Fonts, Typography } from '../constants/fonts';

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.regular,        // 'Pretendard-Regular'
    fontFamily: Fonts.medium,         // 'Pretendard-Medium'
    fontFamily: Fonts.semiBold,       // 'Pretendard-SemiBold'
    fontFamily: Fonts.bold,           // 'Pretendard-Bold'
  }
});
```

### 🚀 Next Steps
1. **Test the app** - Run `npx expo start` to see Pretendard fonts in action
2. **Apply fonts globally** - Update other screens to use the font system
3. **Build for production** - Fonts will be bundled with the app

### 📱 Font Fallbacks
The app is configured with proper fallbacks:
- iOS: Uses system fonts if Pretendard fails to load
- Android: Uses system fonts if Pretendard fails to load
- Web: Uses system fonts if Pretendard fails to load
