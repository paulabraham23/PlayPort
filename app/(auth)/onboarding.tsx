import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { resolveAuthNext } from '@/utils/authGate';
import { isPlaceholderName } from '@/utils/onboarding';

export default function OnboardingScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const returnTo = resolveAuthNext(next);
  const { horizontalPadding, formMaxWidth } = useResponsive();
  const user = useAppStore((s) => s.user);
  const addresses = useAppStore((s) => s.addresses);
  const updateUserProfile = useAppStore((s) => s.updateUserProfile);
  const [name, setName] = useState(
    user?.name && !isPlaceholderName(user.name) ? user.name : ''
  );
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const canContinue = trimmed.length >= 2 && !saving;
  const columnMax = formMaxWidth ?? 440;

  const onContinue = async () => {
    if (!canContinue) return;
    setSaving(true);
    setError(null);
    try {
      // Always persist the real name; mark complete only when an address already exists.
      await updateUserProfile({
        name: trimmed,
        ...(addresses.length > 0 ? { onboardingComplete: true } : {}),
      });
      if (addresses.length > 0) {
        router.replace(returnTo as never);
        return;
      }
      router.replace({
        pathname: '/address/add',
        params: { onboarding: '1', next: returnTo },
      } as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save your name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.wrap,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: columnMax,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          <View style={styles.topRow}>
            <BrandLogo size="lg" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip for now"
              onPress={() => {
                // Skipping once dismisses the name gate; address can be added later from profile.
                void updateUserProfile({ onboardingComplete: true }).finally(() => {
                  router.replace(returnTo as never);
                });
              }}
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Almost there</Text>
            <Text style={styles.title}>What should we call you?</Text>
            <Text style={styles.subtitle}>
              We’ll use this for delivery handoffs and your profile.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your name</Text>
            <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
              <Ionicons name="person-outline" size={18} color={colors.mutedText} />
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. Priya Nair"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                accessibilityLabel="Your name"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (canContinue) void onContinue();
                }}
              />
            </View>

            <Button
              title={saving ? 'Saving…' : 'Continue'}
              fullWidth
              size="lg"
              disabled={!canContinue}
              iconRight={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
              onPress={() => void onContinue()}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Text style={styles.hint}>Next: add your first delivery address.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  wrap: { flex: 1, paddingTop: spacing.md, gap: spacing.xxl },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
  hero: { gap: spacing.sm },
  eyebrow: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 32,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.bodyLg,
    lineHeight: 22,
  },
  form: { gap: spacing.md },
  label: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  inputRowFocused: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.title,
    paddingVertical: spacing.md,
    outlineStyle: 'none' as unknown as undefined,
  },
  error: {
    color: colors.badgeRed,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
  hint: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
