import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const adminStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scroll: {
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    color: colors.primaryText,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.secondaryText,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.bodyLg,
    color: colors.primaryText,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.mutedText,
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  field: {
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  chipActive: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.secondaryText,
  },
  chipTextActive: {
    color: colors.playportOrange,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.danger,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.mutedText,
    paddingVertical: spacing.xl,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableHeaderText: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
