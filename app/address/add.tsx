import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import type { Address } from '@/types';

const TYPES: Address['type'][] = ['home', 'work', 'other'];

export default function AddAddressScreen() {
  const { horizontalPadding } = useResponsive();
  const addAddress = useAppStore((s) => s.addAddress);
  const selectAddress = useAppStore((s) => s.selectAddress);

  const [label, setLabel] = useState('');
  const [type, setType] = useState<Address['type']>('home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const canSave =
    label.trim() &&
    line1.trim() &&
    area.trim() &&
    city.trim() &&
    pincode.trim().length >= 6 &&
    contactName.trim() &&
    phone.trim().length >= 10;

  const onSave = () => {
    if (!canSave) return;
    const id = addAddress({
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
      etaMinutes: area.toLowerCase().includes('whitefield') ? 90 : 32,
      inRapidZone: !area.toLowerCase().includes('whitefield'),
    });
    selectAddress(id);
    router.back();
  };

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Add Address" subtitle="New drop-off location" onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        >
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
          <Field label="Contact name" value={contactName} onChangeText={setContactName} placeholder="Rahul" />
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
            title="Save Address"
            fullWidth
            disabled={!canSave}
            icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
            onPress={onSave}
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  typeChipActive: { borderColor: colors.playportOrange, backgroundColor: '#2A1A14' },
  typeText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  typeTextActive: { color: colors.playportOrange },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
