import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { EXPERIENCES, HUB } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { resolveAuthNext } from '@/utils/authGate';

const CAROUSEL = EXPERIENCES.slice(0, 3);

const TRUST = [
  { icon: 'shield-checkmark-outline' as const, label: 'Sanitized kits' },
  { icon: 'flash-outline' as const, label: '30-min drop' },
  { icon: 'lock-closed-outline' as const, label: 'Zero deposit KYC' },
];

export default function LoginScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const returnTo = resolveAuthNext(next);
  const { horizontalPadding, formMaxWidth, isTablet, isDesktop } = useResponsive();
  const phoneDraft = useAppStore((s) => s.phoneDraft);
  const setPhoneDraft = useAppStore((s) => s.setPhoneDraft);
  const [localPhone, setLocalPhone] = useState(phoneDraft.replace(/\D/g, '').slice(-10) || '');

  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setLocalPhone(digits);
    setPhoneDraft(digits);
  };

  const canGetOtp = localPhone.length === 10;
  const columnMax = formMaxWidth ?? (isTablet || isDesktop ? 520 : undefined);
  const carouselSize = isTablet || isDesktop;

  const goToOtp = () => {
    setPhoneDraft(localPhone || phoneDraft);
    router.push({ pathname: '/(auth)/otp', params: { next: returnTo } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons name="game-controller" size={16} color={colors.white} />
            </View>
            <Text style={styles.brand}>PlayPort</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close and keep browsing"
            onPress={() => router.replace('/(tabs)')}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={20} color={colors.primaryText} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Log in to continue</Text>
          <Text style={styles.heroSub}>
            Browse freely anytime. Sign in when you&apos;re ready to rent, pay, or manage orders.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {CAROUSEL.map((exp) => (
            <View
              key={exp.id}
              style={[styles.carouselCard, carouselSize && styles.carouselCardLg]}
            >
              <Image source={{ uri: exp.image }} style={styles.carouselImage} contentFit="cover" />
              <View style={styles.carouselOverlay} />
              <View style={styles.carouselFade} />
              <Text style={styles.carouselTag}>{exp.tag}</Text>
              <Text style={styles.carouselTitle} numberOfLines={2}>
                {exp.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              value={localPhone}
              onChangeText={onPhoneChange}
              placeholder="98765 43210"
              placeholderTextColor={colors.mutedText}
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.phoneInput}
              accessibilityLabel="Mobile number"
            />
          </View>
          <Button
            title="Get OTP"
            fullWidth
            size="lg"
            disabled={!canGetOtp}
            iconRight={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
            onPress={goToOtp}
          />
        </View>

        <View style={styles.altRow}>
          <Button
            title="WhatsApp"
            variant="secondary"
            style={styles.altBtn}
            icon={<Ionicons name="logo-whatsapp" size={18} color={colors.secondaryText} />}
            onPress={goToOtp}
          />
          <Button
            title="Keep browsing"
            variant="secondary"
            style={styles.altBtn}
            icon={<Ionicons name="storefront-outline" size={18} color={colors.primaryText} />}
            onPress={() => router.replace('/(tabs)')}
          />
        </View>

        <Card style={styles.hubCard}>
          <View style={styles.hubRow}>
            <View style={styles.hubIcon}>
              <Ionicons name="locate" size={20} color={colors.playportOrange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hubName}>{HUB.name.replace(' Dark Hub', ' Hub')}</Text>
              <Text style={styles.hubMeta}>{HUB.statusLabel}</Text>
            </View>
            <View style={styles.hubEta}>
              <Text style={styles.hubEtaValue}>{HUB.etaMinutes}</Text>
              <Text style={styles.hubEtaUnit}>MINS</Text>
            </View>
          </View>
        </Card>

        <View style={styles.trustRow}>
          {TRUST.map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.icon} size={16} color={colors.playportOrange} />
              <Text style={styles.trustLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.terms}>
          By continuing you agree to PlayPort’s Terms of Service and Privacy Policy. OTP login is for
          demo — any 6 digits work.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.baseBlack },
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg, paddingTop: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22 },
  hero: { gap: spacing.sm },
  heroTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 36,
  },
  heroSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  carousel: { gap: 12, paddingRight: 8 },
  carouselCard: {
    width: 148,
    height: 160,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  carouselCardLg: {
    width: 180,
    height: 196,
  },
  carouselImage: { ...StyleSheet.absoluteFill },
  carouselOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  carouselFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  carouselTag: {
    color: colors.playportOrange,
    fontFamily: fonts.mono,
    fontSize: 10,
    marginBottom: 4,
    zIndex: 1,
  },
  carouselTitle: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    zIndex: 1,
  },
  form: { gap: spacing.md },
  label: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  prefixText: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 15 },
  phoneInput: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    outlineStyle: 'none' as unknown as undefined,
  },
  altRow: { flexDirection: 'row', gap: 10 },
  altBtn: { flex: 1 },
  hubCard: { backgroundColor: colors.surfaceAlt },
  hubRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hubIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubName: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  hubMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  hubEta: { alignItems: 'center' },
  hubEtaValue: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 22 },
  hubEtaUnit: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 10 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  trustLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: 'center',
  },
  terms: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
