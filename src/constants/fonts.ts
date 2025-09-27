// Font configuration for Pretendard font family
export const Fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

// Font weight mappings
export const FontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

// Typography styles
export const Typography = {
  h1: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    fontWeight: FontWeights.bold,
  },
  h2: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    fontWeight: FontWeights.semiBold,
  },
  h3: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    fontWeight: FontWeights.medium,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: FontWeights.regular,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: FontWeights.regular,
  },
  small: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontWeight: FontWeights.regular,
  },
} as const;
