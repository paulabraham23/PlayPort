export const colors = {
  baseBlack: '#121212',
  surface: '#1A1A1F',
  surfaceAlt: '#2A2A30',
  surfaceElevated: '#222228',
  border: '#2E2E36',
  primaryText: '#F5F5F5',
  secondaryText: '#9CA3AF',
  mutedText: '#6B7280',
  playportOrange: '#FF5722',
  orangeSoft: '#FF6B4A',
  success: '#4ADE80',
  info: '#3B9EFF',
  danger: '#EF4444',
  warning: '#E8A33D',
  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#FF3B30',
  overlay: 'rgba(0,0,0,0.65)',
  categories: {
    gaming: '#FF6B4A',
    movieNights: '#E8A33D',
    musicKaraoke: '#E2618F',
    partySocial: '#4ADE80',
    family: '#3B9EFF',
    kids: '#A78BFA',
    dateNight: '#F472B6',
    racing: '#F97316',
    vr: '#22D3EE',
    boardGames: '#84CC16',
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
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const fonts = {
  heading: 'SpaceGrotesk_600SemiBold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const layout = {
  maxContentWidth: 720,
  desktopMaxWidth: 1100,
  headerHeight: 56,
  tabBarHeight: 64,
  bottomBarHeight: 72,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
