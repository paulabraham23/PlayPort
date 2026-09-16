import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, layout, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { useFeelStore } from '@/store/feelStore';

export function FeelToast() {
  const toast = useFeelStore((s) => s.toast);
  const toastKey = useFeelStore((s) => s.toastKey);
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        { top: insets.top + layout.headerHeight + 8 },
      ]}
    >
      <Animated.View
        key={toastKey}
        entering={FadeInUp.springify().damping(14).stiffness(200)}
        exiting={FadeOutUp.duration(180)}
        style={styles.toast}
      >
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <View style={styles.icon}>
            <Ionicons name="checkmark" size={14} color={colors.white} />
          </View>
        </Animated.View>
        <Text style={styles.text}>{toast}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 80,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    ...shadows.card,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
});
