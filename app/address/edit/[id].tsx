import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { deleteField } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useLocationDraftStore } from '@/store/locationDraftStore';
import { ensureLoggedIn } from '@/utils/authGate';
import type { Address } from '@/types';

const TYPES: Address['type'][] = ['home', 'work', 'other'];

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const addresses = useAppStore((s) => s.addresses);
  const updateAddress = useAppStore((s) => s.updateAddress);
  const deleteAddress = useAppStore((s) => s.deleteAddress);
  const selectAddress = useAppStore((s) => s.selectAddress);

  const existing = useMemo(() => addresses.find((a) => a.id === id), [addresses, id]);

  const [label, setLabel] = useState(existing?.label ?? '');
  const [type, setType] = useState<Address['type']>(existing?.type ?? 'home');
  const [line1, setLine1] = useState(existing?.line1 ?? '');
  const [line2, setLine2] = useState(existing?.line2 ?? '');
  const [area, setArea] = useState(existing?.area ?? '');
  const [city, setCity] = useState(existing?.city ?? 'Bengaluru');
  const [pincode, setPincode] = useState(existing?.pincode ?? '');
  const [contactName, setContactName] = useState(existing?.contactName ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [instructions, setInstructions] = useState(existing?.instructions ?? '');
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [hydrated, setHydrated] = useState(Boolean(existing));
  // Exact delivery pin — preserved from the saved address unless re-locked.
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(() =>
    Number.isFinite(existing?.lat) && Number.isFinite(existing?.lng)
      ? { lat: existing!.lat as number, lng: existing!.lng as number }
      : null
  );
  const [placeId, setPlaceId] = useState<string | undefined>(existing?.placeId);

  useEffect(() => {
    if (!isAuthenticated) ensureLoggedIn(`/address/edit/${id}`);
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (!existing || hydrated) return;    setLabel(existing.label);
    setType(existing.type);
    setLine1(existing.line1);
    setLine2(existing.line2 ?? '');
    setArea(existing.area);
    setCity(existing.city);
    setPincode(existing.pincode);
    setContactName(existing.contactName);
    setPhone(existing.phone);
    setInstructions(existing.instructions ?? '');
    setIsDefault(existing.isDefault);
    setHydrated(true);
  }, [existing, hydrated]);

  // Pinned on the map screen (/address/locate) → prefill + lock here.
  useFocusEffect(
    useCallback(() => {
      const picked = useLocationDraftStore.getState().draft;
      if (!picked) return;
      useLocationDraftStore.getState().clearDraft();
      setPin({ lat: picked.lat, lng: picked.lng });
      setPlaceId(undefined);
      const a = picked.address;
      if (a) {
        if (a.line1) setLine1(a.line1);
        if (a.area) setArea(a.area);
        if (a.city) setCity(a.city);
        if (a.pincode) setPincode(a.pincode);
      }
    }, [])
  );

  if (!isAuthenticated) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Edit Address" onBack={() => router.back()} />
        <EmptyState
          title="Log in required"
          subtitle="Sign in to edit this address."
          actionLabel="Log in"
          onAction={() => ensureLoggedIn(`/address/edit/${id}`)}
        />
      </Screen>
    );
  }

  if (!existing) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Edit Address" onBack={() => router.back()} />
        <EmptyState
          icon="location-outline"
          title="Address not found"
          subtitle="This location may have been removed."
          actionLabel="Back to addresses"
          onAction={() => router.replace('/address')}
        />
      </Screen>
    );
  }

  const canSave =
    label.trim() &&
    line1.trim() &&
    area.trim() &&
    city.trim() &&
    pincode.trim().length >= 6 &&
    contactName.trim() &&
    phone.trim().length >= 10;

  const applyGuess = (guess?: PinGuess) => {
    if (!guess) return;
    if (guess.line1) setLine1((v) => v || guess.line1!);
    if (guess.area) setArea((v) => v || guess.area!);
    if (guess.city) setCity((v) => v || guess.city!);
    if (guess.pincode) setPincode((v) => v || guess.pincode!);
  };

  const onPlaceSelected = (place: ResolvedPlaceAddress) => {
    if (place.line1) setLine1(place.line1);
    if (place.line2) setLine2(place.line2);
    if (place.area) setArea(place.area);
    if (place.city) setCity(place.city);
    if (place.pincode) setPincode(place.pincode.replace(/\D/g, '').slice(0, 6));
    if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      setPin({ lat: place.lat as number, lng: place.lng as number });
      setPlaceId(place.placeId || undefined);
    }
  };

  const onSave = () => {
    if (!canSave || !id) return;
    updateAddress(id, {
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
      isDefault,
      etaMinutes: area.toLowerCase().includes('whitefield') ? 90 : existing.etaMinutes,
      inRapidZone: !area.toLowerCase().includes('whitefield'),
      ...(pin
        ? { lat: pin.lat, lng: pin.lng }
        : { lat: deleteField() as unknown as number, lng: deleteField() as unknown as number }),
      ...(placeId ? { placeId } : { placeId: deleteField() as unknown as string }),
    });
    if (isDefault) selectAddress(id);
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete address?', 'This location will be removed from your saved list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (id) deleteAddress(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader title="Edit Address" subtitle={existing.label} onBack={() => router.back()} />
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
            onPickOnMap={() => router.push('/address/locate' as never)}
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
          <Field label="Area" value={area} onChangeText={setArea} placeholder="Banjara Hills" />
          <Field label="City" value={city} onChangeText={setCity} placeholder="Bengaluru" />
          <Field
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="560038"
            keyboardType="number-pad"
            maxLength={6}
          />
          <Field label="Contact name" value={contactName} onChangeText={setContactName} />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <Field
            label="Delivery instructions"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />

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

          <Button
            title="Save Changes"
            fullWidth
            disabled={!canSave}
            icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
            onPress={onSave}
          />
          <Button
            title="Delete Address"
            variant="danger"
            fullWidth
            icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
            onPress={onDelete}
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
