import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';

export type PinGuess = {
  area?: string;
  city?: string;
  pincode?: string;
  line1?: string;
};

interface Props {
  lat?: number | null;
  lng?: number | null;
  /** Fired when a pin is locked (GPS or place search). Guess prefills text fields. */
  onPinLocked: (coords: { lat: number; lng: number }, guess?: PinGuess) => void;
  onPinCleared: () => void;
}

/**
 * Zepto-style pin lock: the exact GPS point is saved with the address so the
 * rider navigates to the doorstep, not a fuzzy text-search match.
 */
export function LocationPinSection({ lat, lng, onPinLocked, onPinCleared }: Props) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPin =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001);

  const useCurrentLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied — search the address instead.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      // Best-effort text prefill; the coords are the source of truth either way.
      let guess: PinGuess | undefined;
      try {
        const [rev] = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        if (rev) {
          const pin = String(rev.postalCode ?? '').replace(/\D/g, '').slice(0, 6);
          guess = {
            area:
              rev.district ?? rev.subregion ?? rev.street ?? undefined,
            city: rev.city ?? rev.region ?? undefined,
            pincode: pin || undefined,
            line1: rev.name ?? rev.street ?? undefined,
          };
        }
      } catch {
        guess = undefined;
      }
      onPinLocked(coords, guess);
    } catch {
      setError('Couldn’t get your location — search the address instead.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {hasPin ? (
        <View style={styles.locked}>
          <Ionicons name="location" size={18} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lockedTitle}>Delivery pin locked</Text>
            <Text style={styles.lockedSub}>
              Rider navigates to the exact spot · {lat!.toFixed(5)}, {lng!.toFixed(5)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove delivery pin"
            onPress={onPinCleared}
            hitSlop={8}
          >
            <Text style={styles.clear}>Change</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.unlocked}>
          <Ionicons name="location-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.unlockedTitle}>No delivery pin yet</Text>
            <Text style={styles.unlockedSub}>
              Search above to pin the building, or lock your GPS spot — otherwise the rider only
              gets a fuzzy text search.
            </Text>
          </View>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => void useCurrentLocation()}
        disabled={locating}
        style={[styles.gpsBtn, locating && styles.gpsBtnBusy]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.playportOrange} />
        ) : (
          <Ionicons name="locate" size={18} color={colors.playportOrange} />
        )}
        <Text style={styles.gpsText}>
          {locating ? 'Locking your spot…' : hasPin ? 'Re-lock my current spot' : 'Use my current location'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: 'rgba(20,128,74,0.3)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  lockedTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  lockedSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.caption, marginTop: 2 },
  clear: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  unlocked: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.orangeTint,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  unlockedTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  unlockedSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.orangeBorder,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  gpsBtnBusy: { opacity: 0.7 },
  gpsText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: typeScale.caption },
});
