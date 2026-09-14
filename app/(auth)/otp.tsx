import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function OtpScreen() {
  const { horizontalPadding, formMaxWidth, isXs } = useResponsive();
  const phoneDraft = useAppStore((s) => s.phoneDraft);
  const login = useAppStore((s) => s.login);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  const phoneDisplay = phoneDraft
    ? `+91 ${phoneDraft.replace(/\D/g, '').slice(-10)}`
    : '+91 ••••••••••';

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = otp.join('');
  const canVerify = code.length === 6;
  const columnMax = formMaxWidth;

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onVerify = () => {
    login(phoneDraft || '9876543210');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
        </Pressable>

        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={28} color={colors.playportOrange} />
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>{phoneDisplay}</Text>
        </Text>

        <View style={[styles.otpRow, isXs && styles.otpRowXs]}>
          {otp.map((digit, index) => {
            const active = focusedIndex === index || !!digit;
            return (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(v) => updateDigit(index, v)}
                onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpBox,
                  isXs && styles.otpBoxXs,
                  active ? styles.otpBoxActive : null,
                ]}
                accessibilityLabel={`OTP digit ${index + 1}`}
              />
            );
          })}
        </View>

        <Button
          title="Verify & Continue"
          fullWidth
          size="lg"
          disabled={!canVerify}
          onPress={onVerify}
          icon={<Ionicons name="checkmark-circle" size={18} color={colors.white} />}
        />

        <View style={styles.resendRow}>
          {seconds > 0 ? (
            <Text style={styles.resendMuted}>Resend code in {seconds}s</Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSeconds(30);
                setOtp(['', '', '', '', '', '']);
                inputs.current[0]?.focus();
              }}
            >
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Pressable>
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.changeNumber}>Change mobile number</Text>
        </Pressable>

        <Text style={styles.hint}>Demo tip: enter any 6 digits to continue.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.baseBlack },
  wrap: { flex: 1, paddingTop: spacing.md, gap: spacing.lg },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 28 },
  subtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
  },
  phone: { color: colors.primaryText, fontFamily: fonts.monoMedium },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' },
  otpRowXs: { gap: 6 },
  otpBox: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    aspectRatio: 1,
    maxWidth: 58,
    minWidth: 40,
    minHeight: 48,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.primaryText,
    fontFamily: fonts.monoMedium,
    fontSize: 24,
    textAlign: 'center',
    outlineStyle: 'none' as unknown as undefined,
  },
  otpBoxXs: {
    maxWidth: 48,
    minHeight: 44,
    fontSize: 20,
  },
  otpBoxActive: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  resendRow: { alignItems: 'center', marginTop: spacing.sm },
  resendMuted: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 14 },
  resendLink: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 15 },
  changeNumber: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  hint: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
