// Prevent iOS-only native modules from being autolinked on Android.
// This is important for EAS Android builds: some packages (like SF Symbols)
// don't ship Android native code.
module.exports = {
  dependencies: {
    'react-native-sfsymbols': {
      platforms: {
        android: null,
      },
    },
  },
};






