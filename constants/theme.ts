/**
 * PlayPort — premium quick-commerce UI (Blinkit / Zepto inspired), dark mode.
 */
export const colors = {
  // Surfaces
  baseBlack: '#0A0A0B',
  page: '#0A0A0B',
  surface: '#141416',
  surfaceRaised: '#1A1A1E',
  surfaceAlt: '#222228',
  surfaceHover: '#2A2A32',
  border: '#2E2E36',
  borderSubtle: '#232328',
  borderFocus: 'rgba(232,93,4,0.45)',

  // Text
  primaryText: '#FAFAFA',
  secondaryText: '#A1A1AA',
  mutedText: '#71717A',

  // Brand
  playportOrange: '#F97316',
  ctaPrimary: '#F97316',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#FB923C',
  orangeSoft: '#EA580C',
  orangeTint: 'rgba(249,115,22,0.14)',
  orangeTintStrong: 'rgba(249,115,22,0.24)',
  orangeGlow: 'rgba(249,115,22,0.35)',

  // Status
  success: '#4ADE80',
  successBg: 'rgba(74,222,128,0.12)',
  info: '#60A5FA',
  infoBg: 'rgba(96,165,250,0.12)',
  warning: '#FBBF24',
  danger: '#F87171',
  dangerBg: 'rgba(248,113,113,0.12)',

  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#EF4444',
  overlay: 'rgba(0,0,0,0.72)',
  heroScrim: 'rgba(10,10,11,0.55)',
  heroScrimStrong: 'rgba(10,10,11,0.82)',

  // Delivery
  etaBg: 'rgba(74,222,128,0.14)',
  etaText: '#4ADE80',

  // Category accents — subtle, not neon
  categories: {
    gaming: '#A78BFA',
    movieNights: '#F472B6',
    musicKaraoke: '#38BDF8',
    partySocial: '#FB923C',
    family: '#34D399',
    kids: '#FBBF24',
    dateNight: '#F87171',
    racing: '#60A5FA',
    vr: '#C084FC',
    boardGames: '#94A3B8',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export const fonts = {
  heading: 'Inter_600SemiBold',
  headingMedium: 'Inter_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  mono: 'Inter_500Medium',
  monoMedium: 'Inter_600SemiBold',
} as const;

export const typeScale = {
  caption: 11,
  small: 12,
  body: 14,
  bodyLg: 15,
  title: 17,
  headline: 22,
  display: 28,
  hero: 32,
} as const;

export const layout = {
  maxContentWidth: 840,
  desktopMaxWidth: 1120,
  headerHeight: 60,
  tabBarHeight: 64,
  bottomBarHeight: 76,
  floatingCartHeight: 56,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  glow: {
    shadowColor: colors.playportOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
