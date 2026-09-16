import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { resolveAuthNext } from '@/utils/authGate';

export default function LoginScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const returnTo = resolveAuthNext(next);
  const { horizontalPadding, formMaxWidth } = useResponsive();
  const phoneDraft = useAppStore((s) => s.phoneDraft);
  const setPhoneDraft = useAppStore((s) => s.setPhoneDraft);
  const requestOtp = useAppStore((s) => s.requestOtp);
  const [localPhone, setLocalPhone] = useState(phoneDraft.replace(/\D/g, '').slice(-10) || '');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setLocalPhone(digits);
    setPhoneDraft(digits);
  };

  const canGetOtp = localPhone.length === 10 && !sending;
  const columnMax = formMaxWidth ?? 440;

  const goToOtp = async () => {
    setPhoneDraft(localPhone || phoneDraft);
    setSending(true);
    setSendError(null);
    try {
      await requestOtp(localPhone || phoneDraft);
      router.push({ pathname: '/(auth)/otp', params: { next: returnTo } });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: columnMax,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <Text style={styles.brand}>
              <Text style={styles.brandPlay}>Play</Text>
              <Text style={styles.brandPort}>Port</Text>
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close and keep browsing"
              onPress={() => router.replace('/(tabs)')}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.secondaryText} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Account</Text>
            <Text style={styles.heroTitle}>Sign in to continue</Text>
            <Text style={styles.heroSub}>
              Use your mobile number to save addresses, track rentals, and checkout.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Mobile number</Text>
            <View style={[styles.phoneRow, focused && styles.phoneRowFocused]}>
              <Text style={styles.prefixText}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                value={localPhone}
                onChangeText={onPhoneChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="98765 43210"
                placeholderTextColor={colors.mutedText}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.phoneInput}
                accessibilityLabel="Mobile number"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (canGetOtp) void goToOtp();
                }}
              />
            </View>

            <Button
              title={sending ? 'Sending…' : 'Continue'}
              fullWidth
              size="lg"
              disabled={!canGetOtp}
              iconRight={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
              onPress={() => void goToOtp()}
            />
            {sendError ? <Text style={styles.sendError}>{sendError}</Text> : null}
          </View>

          <View style={styles.trustLine}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedText} />
            <Text style={styles.trustText}>Secure OTP · Zero deposit KYC · 30-min delivery</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)')}
            style={styles.browseLink}
          >
            <Text style={styles.browseText}>Continue browsing as guest</Text>
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to PlayPort’s Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
    gap: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    letterSpacing: -0.4,
  },
  brandPlay: { color: colors.primaryText },
  brandPort: { color: colors.playportOrange },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  hero: { gap: spacing.sm, marginTop: spacing.lg },
  eyebrow: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  heroSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.bodyLg,
    lineHeight: 22,
    maxWidth: 340,
  },
  form: { gap: spacing.md },
  label: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  phoneRow: {
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
  phoneRowFocused: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  prefixText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.bodyLg,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.title,
    paddingVertical: spacing.md,
    outlineStyle: 'none' as unknown as undefined,
    letterSpacing: 0.5,
  },
  sendError: {
    color: colors.badgeRed,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
  trustLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trustText: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
  browseLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  browseText: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    textDecorationLine: 'underline',
  },
  terms: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
