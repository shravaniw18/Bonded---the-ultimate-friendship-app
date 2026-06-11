// frontend/lib/theme.ts
// Global design tokens and theme configuration for Bonded

export const theme = {
  colors: {
    primary: '#70a9a1',
    secondary: '#9ec1a3',
    surface: '#cfe0c3',
    accent: '#dbc2cf',
    muted: '#9fa2b2',
    dark: '#3c7a89',
    background: '#f9faf8',
    white: '#ffffff',
    error: '#e07070',
    text: {
      primary: '#2a3d3b',
      secondary: '#9fa2b2',
      inverse: '#ffffff',
    }
  },
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 999,
  },
};
