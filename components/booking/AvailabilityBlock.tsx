import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import {
  asapWindowStart,
  checkSlot,
  findNextFreeSlot,
  windowLabel,
  type SlotCheckItem,
} from '@/lib/availability';
import { isServiceOpen } from '@/utils/serviceHours';

interface Props {
  items: SlotCheckItem[];
  hubId?: string;
  /** Null = check the ASAP window. */
  startIso: string | null;
  /** Called with the suggested start when the user taps "book X–Y instead". */
  onApplySlot?: (startIso: string) => void;
}

type State =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available'; window: string }
  | { kind: 'soldout'; name: string; window: string; suggestionIso: string | null; suggestionWindow: string | null; hours: number }
  | { kind: 'closed' };

/**
 * Orange "Check Availability" for ASAP or a scheduled window.
 * Simple verdict UI + next-free-slot suggestion when sold out.
 */
export function AvailabilityBlock({ items, hubId, startIso, onApplySlot }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  // A verdict belongs to the exact window + items checked. Any change
  // (new slot, plan, quantity, cart edit) invalidates it back to idle.
  const contextKey = `${startIso ?? 'asap'}|${items
    .map((i) => `${i.productId}:${i.hours}:${i.quantity ?? 1}`)
    .join(',')}|${hubId ?? ''}`;
  useEffect(() => {
    setState({ kind: 'idle' });
  }, [contextKey]);

  const check = async () => {
    if (!items.length) return;
    const now = new Date();
    const start = startIso ?? asapWindowStart(now);
    if (!startIso && !isServiceOpen(now)) {
      setState({ kind: 'closed' });
      return;
    }
    setState({ kind: 'checking' });
    const maxHours = Math.max(1, ...items.map((i) => i.hours));
    for (const item of items) {
      const ok = await checkSlot(item.productId, hubId, start, item.hours, item.quantity ?? 1);
      if (!ok) {
        const suggestionIso = await findNextFreeSlot(
          item.productId,
          hubId,
          start,
          item.hours,
          item.quantity ?? 1,
          now
        );
        setState({
          kind: 'soldout',
          name: item.name,
          window: windowLabel(start, maxHours),
          suggestionIso,
          suggestionWindow: suggestionIso ? windowLabel(suggestionIso, item.hours) : null,
          hours: item.hours,
        });
        return;
      }
    }
    setState({ kind: 'available', window: windowLabel(start, maxHours) });
  };

  return (
    <View style={styles.wrap}>
      <Button
        title={state.kind === 'checking' ? 'Checking…' : 'Check Availability'}
        disabled={state.kind === 'checking' || !items.length}
        icon={<Ionicons name="calendar-outline" size={18} color={colors.white} />}
        onPress={() => void check()}
      />

      {state.kind === 'available' ? (
        <View style={[styles.card, styles.okCard]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.okTitle}>Slot available at this time.</Text>
            <Text style={styles.okSub}>{state.window} · ready to book.</Text>
          </View>
        </View>
      ) : null}

      {state.kind === 'soldout' ? (
        <View style={[styles.card, styles.soldCard]}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.soldTitle}>
              Currently the slot is sold out for {state.window}
              {items.length > 1 ? ` (${state.name})` : ''}.
            </Text>
            {state.suggestionIso && state.suggestionWindow ? (
              <>
                <Text style={styles.soldSub}>
                  You can book {state.suggestionWindow} — the slot is available then.
                </Text>
                {onApplySlot ? (
                  <View style={styles.applyRow}>
                    <Button
                      title={`Book ${state.suggestionWindow} instead`}
                      size="sm"
                      variant="secondary"
                      onPress={() => onApplySlot(state.suggestionIso as string)}
                    />
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.soldSub}>Try another day — everything nearby is booked.</Text>
            )}
          </View>
        </View>
      ) : null}

      {state.kind === 'closed' ? (
        <View style={[styles.card, styles.soldCard]}>
          <Ionicons name="moon-outline" size={20} color={colors.secondaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.soldTitle}>We’re closed 12–8 AM.</Text>
            <Text style={styles.soldSub}>ASAP resumes at 8 AM — or schedule a slot ahead.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  okCard: { backgroundColor: colors.successBg, borderColor: 'rgba(20,128,74,0.3)' },
  okTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  okSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  soldCard: { backgroundColor: colors.dangerBg, borderColor: 'rgba(242,109,109,0.35)' },
  soldTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, lineHeight: 20 },
  soldSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, lineHeight: 17 },
  applyRow: { marginTop: 8, alignSelf: 'flex-start' },
});
