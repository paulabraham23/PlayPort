/**
 * PlayPort — quick-commerce commercial UI (Blinkit / Zepto inspired), dark mode.
 * Dense product grids, Inter-only typography, one orange CTA.
 */
export const colors = {
  // Surfaces (dark)
  baseBlack: '#0F0F10',
  page: '#0F0F10',
  surface: '#171719',
  surfaceRaised: '#1C1C1F',
  surfaceAlt: '#222226',
  border: '#2C2C31',
  borderSubtle: '#242428',

  // Text
  primaryText: '#F2F2F3',
  secondaryText: '#9A9AA2',
  mutedText: '#6E6E76',

  // Brand CTA
  playportOrange: '#E85D04',
  ctaPrimary: '#E85D04',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#F06A12',
  orangeSoft: '#C4785A',
  orangeTint: 'rgba(232,93,4,0.12)',
  orangeTintStrong: 'rgba(232,93,4,0.2)',

  // Status
  success: '#5CB88A',
  successBg: 'rgba(92,184,138,0.12)',
  info: '#6B9FD4',
  infoBg: 'rgba(107,159,212,0.12)',
  warning: '#C9A86C',
  danger: '#E07070',
  dangerBg: 'rgba(224,112,112,0.12)',

  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#E03E3E',
  overlay: 'rgba(0,0,0,0.65)',
  heroScrim: 'rgba(15,15,16,0.88)',

  // Delivery chip
  etaBg: 'rgba(92,184,138,0.14)',
  etaText: '#5CB88A',

  categories: {
    gaming: '#9A9AA2',
    movieNights: '#9A9AA2',
    musicKaraoke: '#9A9AA2',
    partySocial: '#9A9AA2',
    family: '#9A9AA2',
    kids: '#9A9AA2',
    dateNight: '#9A9AA2',
    racing: '#9A9AA2',
    vr: '#9A9AA2',
    boardGames: '#9A9AA2',
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
  huge: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

/** Inter only — no display / gamer fonts */
export const fonts = {
  heading: 'Inter_600SemiBold',
  headingMedium: 'Inter_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  mono: 'Inter_500Medium',
  monoMedium: 'Inter_600SemiBold',
} as const;

export const layout = {
  maxContentWidth: 840,
  desktopMaxWidth: 1120,
  headerHeight: 56,
  tabBarHeight: 60,
  bottomBarHeight: 72,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;
