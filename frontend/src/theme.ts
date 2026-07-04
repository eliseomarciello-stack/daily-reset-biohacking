export const theme = {
  color: {
    surface: '#FAF9F6',
    surfaceMuted: '#F0EFEA',
    card: '#FFFFFF',
    text: '#1A1D1A',
    textMuted: '#4A5046',
    textFaint: '#8A8F86',
    border: '#E8E6E1',
    borderStrong: '#D1CFC9',
    // Biohacking Quotidiano brand
    brand: '#307d7c',
    brandDark: '#142f34',
    brandSoft: '#E4EFEE',
    brandSoftBorder: '#B9D4D3',
    success: '#3A7D44',
    warning: '#D97B29',
    error: '#BA3A30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },
  font: {
    // Modern sans-serif system stack
    family: undefined as string | undefined,
    sizes: {
      xs: 12,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      display: 30,
    },
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    lifted: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  layout: {
    maxWidth: 720,
  },
} as const;

export type Theme = typeof theme;
