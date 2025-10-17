// Typography configuration for Century Gothic font
export const typography = {
  // Font family
  fontFamily: 'Century Gothic',
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Common text styles
  styles: {
    h1: {
      fontFamily: 'Century Gothic',
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Century Gothic',
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: 'Century Gothic',
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: 'Century Gothic',
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 1.3,
    },
    body: {
      fontFamily: 'Century Gothic',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    bodySmall: {
      fontFamily: 'Century Gothic',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    caption: {
      fontFamily: 'Century Gothic',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontFamily: 'Century Gothic',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    buttonSmall: {
      fontFamily: 'Century Gothic',
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1.2,
    },
  },
};

// Helper function to get font family with fallback
export const getFontFamily = (weight?: string) => {
  const baseFont = 'Century Gothic';
  if (weight === 'bold' || weight === '700') {
    return `${baseFont}-Bold`;
  }
  return baseFont;
};

// Helper function to create text style with Century Gothic
export const createTextStyle = (size: number, weight: string = '400', lineHeight?: number) => ({
  fontFamily: getFontFamily(weight),
  fontSize: size,
  fontWeight: weight,
  lineHeight: lineHeight || size * 1.4,
});
