import { Platform } from 'react-native';

export const BrandTheme = {
  colors: {
    background: '#fff8f6',
    surface: '#fff8f6',
    surfaceContainer: '#ffeae0',
    surfaceContainerLow: '#fff1eb',
    surfaceContainerHigh: '#f9e4da',
    surfaceLowest: '#ffffff',
    primary: '#9a4600',
    primaryAccent: '#f27b27',
    secondary: '#555f6d',
    tertiary: '#006590',
    error: '#ba1a1a',
    onSurface: '#241913',
    onSurfaceVariant: '#574237',
    onPrimary: '#ffffff',
    outline: '#8a7265',
    outlineVariant: '#dec1b2',
  },
  typography: {
    headline: 'Manrope',
    body: 'Inter',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    lg: 10,
    xl: 12,
    xxl: 16,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#241913',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
};

export const Colors = {
  light: {
    text: BrandTheme.colors.onSurface,
    background: BrandTheme.colors.background,
    tint: BrandTheme.colors.primary,
    icon: BrandTheme.colors.onSurfaceVariant,
    tabIconDefault: BrandTheme.colors.onSurfaceVariant,
    tabIconSelected: BrandTheme.colors.primary,
  },
  dark: {
    text: '#ffede5',
    background: '#241913',
    tint: '#ffb68c',
    icon: '#f4ded4',
    tabIconDefault: '#f4ded4',
    tabIconSelected: '#ffb68c',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
