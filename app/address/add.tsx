import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { PlacesAutocomplete } from '@/components/address/PlacesAutocomplete';
import { LocationPinSection, type PinGuess } from '@/components/address/LocationPinSection';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import type { ResolvedPlaceAddress } from '@/lib/places';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { ensureLoggedIn, resolveAuthNext } from '@/utils/authGate';
import type { Address } from '@/types';

const TYPES: Address['type'][] = ['home', 'work', 'other'];

export default function AddAddressScreen() {
  const { onboarding, next } = useLocalSearchParams<{ onboarding?: string; next?: string }>();
  const isOnboarding = onboarding === '1';
  const returnTo = resolveAuthNext(next);
  const { horizontalPadding } = useResponsive();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const addAddress = useAppStore((s) => s.addAddress);
  const selectAddress = useAppStore((s) => s.selectAddress);
  const updateUserProfile = useAppStore((s) => s.updateUserProfile);
  const hub = useCatalogStore((s) => s.hub);

  useEffect(() => {
    if (!isAuthenticated) ensureLoggedIn('/address/add');
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Add address" onBack={() => router.back()} />
        <EmptyState
          title="Log in required"
          subtitle="Sign in to save a delivery address."
          actionLabel="Log in"
          onAction={() => ensureLoggedIn('/address/add')}
        />
      </Screen>
    );
  }

  const phoneDigits = useMemo(
    () => (user?.phone ?? '').replace(/\D/g, '').slice(-10),
    [user?.phone]
  );

  const [label, setLabel] = useState(isOnboarding ? 'Home' : '');
  const [type, setType] = useState<Address['type']>('home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState(hub?.city || 'Bengaluru');
  const [pincode, setPincode] = useState('');
  const [contactName, setContactName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(phoneDigits);
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(isOnboarding || false);
  const [saving, setSaving] = useState(false);
  // Exact delivery pin — from Places search or GPS lock (Zepto-style).
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);

  const canSave =
    label.trim() &&
    line1.trim() &&
    area.trim() &&
    city.trim() &&
    pincode.trim().length >= 6 &&
    contactName.trim() &&
    phone.trim().length >= 10 &&
    !saving;

  const applyGuess = (guess?: PinGuess) => {
    if (!guess) return;
    if (guess.line1) setLine1((v) => v || guess.line1!);
    if (guess.area) setArea((v) => v || guess.area!);
    if (guess.city) setCity((v) => (v === 'Bengaluru' || !v ? guess.city! : v));
    if (guess.pincode) setPincode((v) => v || guess.pincode!);
  };

  const onPlaceSelected = (place: ResolvedPlaceAddress) => {
    if (place.line1) setLine1(place.line1);
    if (place.line2) setLine2(place.line2);
    if (place.area) setArea(place.area);
    if (place.city) setCity(place.city);
    if (place.pincode) setPincode(place.pincode.replace(/\D/g, '').slice(0, 6));
    if (!label.trim()) setLabel(place.area || place.city || 'Home');
    // Lock the exact rooftop pin — this is what the rider navigates to.
    if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      setPin({ lat: place.lat as number, lng: place.lng as number });
      setPlaceId(place.placeId || undefined);
    }
  };

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const id = await addAddress({
        label: label.trim(),
        type,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        area: area.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        instructions: instructions.trim() || undefined,
        isDefault: isOnboarding ? true : isDefault,
        etaMinutes: hub?.etaMinutes ?? 32,
        inRapidZone: true,
        ...(pin ? { lat: pin.lat, lng: pin.lng } : {}),
        ...(placeId ? { placeId } : {}),
      });
      selectAddress(id);

      if (isOnboarding) {
        await updateUserProfile({
          onboardingComplete: true,
          homeHub: hub?.city || hub?.name || city.trim(),
          homeHubId: hub?.id,
        });
        router.replace(returnTo as never);
        return;
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => {
    if (isOnboarding) {
      router.replace({
        pathname: '/(auth)/onboarding',
        params: { next: returnTo },
      } as never);
      return;
    }
    router.back();
  };

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader
        title={isOnboarding ? 'Delivery address' : 'Add Address'}
        subtitle={isOnboarding ? 'Where should we drop your kit?' : 'New drop-off location'}
        onBack={onBack}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        >
          <PlacesAutocomplete onPlaceSelected={onPlaceSelected} />

          <LocationPinSection
            lat={pin?.lat}
            lng={pin?.lng}
            onPinLocked={(coords, guess) => {
              setPin(coords);
              applyGuess(guess);
            }}
            onPinCleared={() => {
              setPin(null);
              setPlaceId(undefined);
            }}
          />

          <Field label="Label" value={label} onChangeText={setLabel} placeholder="Home, Studio…" />

          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="button"
                onPress={() => setType(t)}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field label="Address line 1" value={line1} onChangeText={setLine1} placeholder="Flat / Building" />
          <Field label="Address line 2" value={line2} onChangeText={setLine2} placeholder="Street (optional)" />
          <Field label="Area" value={area} onChangeText={setArea} placeholder="Indiranagar" />
          <Field label="City" value={city} onChangeText={setCity} placeholder="Bengaluru" />
          <Field
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="560038"
            keyboardType="number-pad"
            maxLength={6}
          />
          <Field
            label="Contact name"
            value={contactName}
            onChangeText={setContactName}
            placeholder="Your name"
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
          />
          <Field
            label="Delivery instructions"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Gate code, landmark…"
            multiline
          />

          {!isOnboarding ? (
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isDefault }}
              onPress={() => setIsDefault((v) => !v)}
              style={styles.switchRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Set as default</Text>
                <Text style={styles.switchSub}>Use this for checkout & express routing</Text>
              </View>
              <View style={[styles.toggle, isDefault && styles.toggleOn]}>
                <View style={[styles.knob, isDefault && styles.knobOn]} />
              </View>
            </Pressable>
          ) : null}

          <Button
            title={saving ? 'Saving…' : isOnboarding ? 'Finish setup' : 'Save Address'}
            fullWidth
            disabled={!canSave}
            icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
            onPress={() => void onSave()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  field: { gap: 6 },
  fieldLabel: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 48,
  },
  inputMulti: { minHeight: 88, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  typeChipActive: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  typeText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  typeTextActive: { color: colors.playportOrange },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  switchTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  switchSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.playportOrange },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  knobOn: { alignSelf: 'flex-end' },
});
