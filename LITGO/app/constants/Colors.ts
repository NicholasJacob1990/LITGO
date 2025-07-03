/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#667eea';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#667eea',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#667eea',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
  },
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#F8FAFC',
  trust: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
};
