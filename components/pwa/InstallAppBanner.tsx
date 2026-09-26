import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * Bottom banner: "Install PlayPort as an app" (Chrome/Edge prompt or iOS instructions).
 */
export function InstallAppBanner() {
  const { visible, canPrompt, iosHint, install, dismiss } = usePwaInstall();
  const { horizontalPadding, contentWidth } = useResponsive();

  if (Platform.OS !== 'web' || !visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View
        style={[
          styles.banner,
          { marginHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%' },
        ]}
      >
        <BrandLogo size={44} />
        <View style={styles.copy}>
          <Text style={styles.title}>Install PlayPort</Text>
          <Text style={styles.body}>
            {iosHint
              ? 'Tap Share, then Add to Home Screen for the app experience.'
              : 'Install this website as an app for faster access and a full-screen experience.'}
          </Text>
        </View>
        <View style={styles.actions}>
          {canPrompt ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Install PlayPort app"
              onPress={() => void install()}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>Install</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss install prompt"
            onPress={dismiss}
            hitSlop={8}
            style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
          >
            <Text style={styles.ghostText}>{iosHint ? 'Got it' : 'Not now'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
  body: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    lineHeight: 16,
  },
  actions: { gap: 6, alignItems: 'stretch' },
  primaryBtn: {
    backgroundColor: colors.playportOrange,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    textAlign: 'center',
  },
  ghostBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  ghostText: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
