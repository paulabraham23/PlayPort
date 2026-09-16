import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export default function SettingsScreen() {
  const { horizontalPadding } = useResponsive();
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader title="Settings" subtitle="PlayPort preferences" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.section}>Appearance</Text>
        <Card style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="moon-outline" size={18} color={colors.playportOrange} />
            <View>
              <Text style={styles.label}>Theme</Text>
              <Text style={styles.sub}>Dark mode</Text>
            </View>
          </View>
          <View style={styles.locked}>
            <Text style={styles.lockedText}>Locked</Text>
            <Ionicons name="lock-closed" size={14} color={colors.mutedText} />
          </View>
        </Card>

        <Text style={styles.section}>Language</Text>
        <Card style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="globe-outline" size={18} color={colors.playportOrange} />
            <View>
              <Text style={styles.label}>Language</Text>
              <Text style={styles.sub}>English</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedText} />
        </Card>

        <Text style={styles.section}>Notifications</Text>
        <Card padded={false}>
          <ToggleRow
            label="Order updates"
            sub="Confirmed, packed, cancelled"
            value={orderAlerts}
            onToggle={() => setOrderAlerts((v) => !v)}
            last={false}
          />
          <ToggleRow
            label="Delivery & setup"
            sub="Rider ETA and specialist arrival"
            value={deliveryAlerts}
            onToggle={() => setDeliveryAlerts((v) => !v)}
            last={false}
          />
          <ToggleRow
            label="Offers & vibes"
            sub="Weekend drops and curated kits"
            value={promoAlerts}
            onToggle={() => setPromoAlerts((v) => !v)}
            last
          />
        </Card>

        <Text style={styles.section}>About</Text>
        <Card style={styles.row}>
          <View style={styles.left}>
            <Ionicons name="information-circle-outline" size={18} color={colors.playportOrange} />
            <View>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.sub}>PlayPort OS v2.4.0</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onToggle,
  last,
}: {
  label: string;
  sub: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={[styles.toggleRow, !last && styles.toggleBorder]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  section: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  lockedText: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 11 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
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
