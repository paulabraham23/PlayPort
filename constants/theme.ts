/**
 * PlayPort — corporate quick-commerce design system.
 * Deep "ink" canvas + matte neutral orange brand.
 */
export const colors = {
  // ── Surfaces — deep ink with cool undertone ────────────────────────────
  baseBlack: '#07080C',
  page: '#0B0D12',
  surface: '#10131B',
  surfaceRaised: '#151926',
  surfaceAlt: '#1C2130',
  surfaceHover: '#242A3D',
  border: '#2A3042',
  borderSubtle: '#1E2331',
  borderFocus: 'rgba(180, 100, 48, 0.40)',

  // ── Text ───────────────────────────────────────────────────────────────
  primaryText: '#F4F6FB',
  secondaryText: '#9AA3B8',
  mutedText: '#69748C',

  // ── Brand — matte neutral orange (desaturated clay, not neon) ─────────
  playportOrange: '#B86A32',
  ctaPrimary: '#B86A32',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#C87A42',
  orangeSoft: '#945528',
  orangeDeep: '#73401E',
  orangeTint: 'rgba(184, 106, 50, 0.12)',
  orangeTintStrong: 'rgba(184, 106, 50, 0.20)',
  orangeGlow: 'rgba(184, 106, 50, 0.18)',
  orangeBorder: 'rgba(184, 106, 50, 0.42)',

  // ── Status ─────────────────────────────────────────────────────────────
  success: '#3DD68C',
  successBg: 'rgba(61, 214, 140, 0.12)',
  info: '#5EA8FF',
  infoBg: 'rgba(94, 168, 255, 0.12)',
  warning: '#F5C242',
  danger: '#F26D6D',
  dangerBg: 'rgba(242, 109, 109, 0.12)',

  // ── Primitives ─────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#EF4444',
  overlay: 'rgba(4, 6, 10, 0.72)',
  heroScrim: 'rgba(7, 8, 12, 0.55)',
  heroScrimStrong: 'rgba(7, 8, 12, 0.85)',

  // ── Delivery ───────────────────────────────────────────────────────────
  etaBg: 'rgba(61, 214, 140, 0.12)',
  etaText: '#3DD68C',

  // ── Category accents — muted corporate jewel tones ────────────────────
  categories: {
    gaming: '#A78BFA',
    movieNights: '#F0A6CA',
    musicKaraoke: '#5EA8FF',
    partySocial: '#B86A32',
    family: '#3DD68C',
    kids: '#F5C242',
    dateNight: '#F27E7E',
    racing: '#5EA8FF',
    vr: '#C084FC',
    boardGames: '#94A3B8',
  },
} as const;

/** Signature vertical gradients (module-level: shared style objects). */
export const gradients = {
  brand: ['#C87A42', '#B86A32', '#945528'] as const,
  brandSubtle: ['#B86A32', '#945528'] as const,
  heroScrim: ['rgba(7,8,12,0)', 'rgba(7,8,12,0.82)', 'rgba(7,8,12,0.97)'] as const,
  heroVeil: ['rgba(7,8,12,0.45)', 'rgba(7,8,12,0.35)'] as const,
  cardSheen: ['rgba(255,255,255,0.045)', 'rgba(255,255,255,0)'] as const,
  cta: ['#C87A42', '#A35A28'] as const,
  statusbar: ['rgba(11,13,18,0.92)', 'rgba(11,13,18,0.75)', 'rgba(11,13,18,0.92)'] as const,
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
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  full: 999,
} as const;

export const fonts = {
  heading: 'Inter_700Bold',
  headingMedium: 'Inter_600SemiBold',
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
  hero: 34,
} as const;

export const layout = {
  maxContentWidth: 840,
  desktopMaxWidth: 1200,
  ultrawideMaxWidth: 1320,
  headerHeight: 64,
  tabBarHeight: 64,
  bottomBarHeight: 76,
  floatingCartHeight: 56,
} as const;

/** Signature multi-layer shadow recipes — corporate depth, zero neon. */
export const shadows = {
  card: {
    shadowColor: '#04060A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 7,
  },
  soft: {
    shadowColor: '#04060A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: colors.playportOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  /** Hover-lift on web (paired with boxShadow). */
  lift: {
    shadowColor: '#04060A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 26,
    elevation: 9,
  },
} as const;

/** Web-only hairline + lift recipe (boxShadow unsupported in RN StyleSheet typings). */
export const webShadows = {
  card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px rgba(4,6,10,0.35)',
  soft: '0 1px 0 rgba(255,255,255,0.025) inset, 0 6px 18px rgba(4,6,10,0.30)',
  glow: '0 6px 18px rgba(184,106,50,0.18)',
  lift: '0 18px 44px rgba(4,6,10,0.45)',
} as const;
