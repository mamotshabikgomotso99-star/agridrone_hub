/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  brand: {
    primary: '#0B3821',
    secondary: '#1D6633',
    leaf: '#3E8A45',
    lime: '#A4C94C',
  },
  background: {
    main: '#E3EEDF',
    softGreen: '#D3E7CE',
    cardGreen: '#EEF5E9',
    white: '#FFFFFF',
    lightGrey: '#E9EFE6',
    softBlue: '#E5F1F1',
    softAmber: '#FCF1D8',
    softRed: '#FEF2F2',
    softPurple: '#F3E8FF',
  },
  text: {
    primary: '#142F20',
    secondary: '#66756B',
    inverse: '#FFFFFF',
  },
  accent: {
    skyBlue: '#3798A3',
    earthBrown: '#8A6238',
    purple: '#8B5CF6',
  },
  service: {
    cropMonitoring: '#E7F2E2',
    aerialMapping: '#E5F1F1',
    landSurveying: '#F4F0E5',
    cropHealth: '#DDF0D8',
    irrigation: '#DDEFE8',
    infrastructure: '#EFF2EC',
    pestMonitoring: '#FCF1D8',
    general: '#EAF0E3',
  },
  status: {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0284C7',
  },
  statusText: {
    success: '#14532D',
    warning: '#854D0E',
    error: '#B91C1C',
    info: '#075985',
  },
  border: {
    default: '#D0DECB',
    green: '#A8CCA7',
    amber: '#FDE68A',
    red: '#FECACA',
    purple: '#E9D5FF',
  },
  light: {
    text: '#142F20',
    background: '#E3EEDF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#D3E7CE',
    textSecondary: '#66756B',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export const palette = {
  green: Colors.brand.primary,
  agriculturalGreen: Colors.brand.secondary,
  brightGreen: Colors.brand.leaf,
  lime: Colors.brand.lime,
  blue: Colors.accent.skyBlue,
  navy: Colors.text.primary,
  cream: Colors.background.main,
  softGreen: Colors.background.softGreen,
  surfaceGreen: Colors.background.cardGreen,
  background: Colors.background.main,
  white: Colors.background.white,
  lightGrey: Colors.background.lightGrey,
  softBlue: Colors.background.softBlue,
  softAmber: Colors.background.softAmber,
  softRed: Colors.background.softRed,
  softPurple: Colors.background.softPurple,
  muted: Colors.text.secondary,
  border: Colors.border.default,
  greenBorder: Colors.border.green,
  amberBorder: Colors.border.amber,
  redBorder: Colors.border.red,
  purpleBorder: Colors.border.purple,
  earthBrown: Colors.accent.earthBrown,
  purple: Colors.accent.purple,
  amber: Colors.status.warning,
  red: Colors.status.error,
  success: Colors.status.success,
  info: Colors.status.info,
  successText: Colors.statusText.success,
  warningText: Colors.statusText.warning,
  errorText: Colors.statusText.error,
  infoText: Colors.statusText.info,
  placeholder: '#94A3B8',
  service: Colors.service,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
