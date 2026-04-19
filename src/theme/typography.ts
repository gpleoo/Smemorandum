import { TextStyle } from 'react-native';

// Font families match the names exposed by @expo-google-fonts/inter.
const INTER_REGULAR = 'Inter_400Regular';
const INTER_MEDIUM  = 'Inter_500Medium';
const INTER_SEMI    = 'Inter_600SemiBold';
const INTER_BOLD    = 'Inter_700Bold';
const INTER_EXTRA   = 'Inter_800ExtraBold';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: INTER_EXTRA,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: INTER_BOLD,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: INTER_SEMI,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontFamily: INTER_REGULAR,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: INTER_REGULAR,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontFamily: INTER_MEDIUM,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  button: {
    fontFamily: INTER_SEMI,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  label: {
    fontFamily: INTER_MEDIUM,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
};
