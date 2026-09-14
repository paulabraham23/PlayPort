import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatAddressLine } from '@/utils/format';
import type { Address } from '@/types';

interface Props {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function AddressCard({
  address,
  selected,
  onPress,
  onEdit,
  onDelete,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={[styles.card, selected && styles.selected, !address.inRapidZone && styles.outOfZone]}>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons
              name={address.type === 'work' ? 'briefcase' : 'home'}
              size={16}
              color={colors.playportOrange}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{address.label}</Text>
              {address.isDefault ? (
                <Badge label="DEFAULT" color={colors.playportOrange} backgroundColor={colors.orangeTint} />
              ) : null}
              {!address.inRapidZone ? <Badge label="OUT OF RAPID ZONE" /> : null}
            </View>
            <Text style={styles.sub}>
              {address.isDefault
                ? 'PRIMARY DESTINATION'
                : address.inRapidZone
                  ? 'SAVED LOCATION'
                  : 'SCHEDULED SLOT'}
            </Text>
          </View>
        </View>

        <Text style={styles.line}>{formatAddressLine(address)}</Text>
        <Text style={styles.meta}>
          {address.contactName} · {address.phone}
        </Text>
        {address.instructions ? <Text style={styles.note}>{address.instructions}</Text> : null}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.eta}>
          {address.inRapidZone
            ? `🛵 ${address.etaMinutes} MIN EXPRESS HUB ROUTE`
            : '📅 SAME-DAY EVENING SLOT'}
        </Text>
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Edit address" onPress={onEdit} hitSlop={8}>
              <Ionicons name="pencil" size={16} color={colors.secondaryText} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Delete address" onPress={onDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={colors.secondaryText} />
            </Pressable>
          ) : null}
          {actionLabel && onAction ? (
            <Pressable onPress={onAction}>
              <Text style={styles.action}>{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 8,
  },
  selected: { borderColor: colors.playportOrange },
  outOfZone: { opacity: 0.95 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16 },
  sub: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, marginTop: 2, letterSpacing: 0.6 },
  line: { color: colors.primaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 8 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  note: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  eta: { color: colors.playportOrange, fontFamily: fonts.mono, fontSize: 11, flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  action: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 13 },
});
