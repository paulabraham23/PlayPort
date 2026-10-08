import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPinPicker } from '@/components/address/MapPinPicker';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { reverseGeocodeLatLng, type ReverseGeocodedAddress } from '@/lib/places';
import { useCatalogStore } from '@/store/catalogStore';
import { useLocationDraftStore } from '@/store/locationDraftStore';

const FALLBACK = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

/**
 * Zepto-style location capture: drag the map under a fixed pin, confirm the
 * spot, then fill flat/floor details in the address form. The exact coords
 * travel with the address → order → rider navigation.
 */
export default function LocateAddressScreen() {
  const { horizontalPadding } = useResponsive();
  const hub = useCatalogStore((s) => s.hub);
  const setDraft = useLocationDraftStore((s) => s.setDraft);

  const [initial, setInitial] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [resolved, setResolved] = useState<ReverseGeocodedAddress | null>(null);
  const [resolving, setResolving] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Start at device GPS → hub → city fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setInitial({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            return;
          }
        }
      } catch {
        // fall through
      }
      if (!cancelled) {
        const hubLat = hub?.lat;
        const hubLng = hub?.lng;
        setInitial(
          Number.isFinite(hubLat) && Number.isFinite(hubLng)
            ? { lat: hubLat as number, lng: hubLng as number }
            : FALLBACK
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCenterChange = (next: { lat: number; lng: number }) => {
    setCenter(next);
    const id = ++requestId.current;
    setResolving(true);
    void reverseGeocodeLatLng(next.lat, next.lng)
      .then((address) => {
        if (id !== requestId.current) return;
        setResolved(address);
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setResolved(null);
      })
      .finally(() => {
        if (id === requestId.current) setResolving(false);
      });
  };

  const onConfirm = () => {
    if (!center) return;
    setDraft({ lat: center.lat, lng: center.lng, address: resolved });
    router.back();
  };

  return (
    <Screen showHeader={false}>
      <View style={[styles.bar, { paddingHorizontal: horizontalPadding }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Pin your location</Text>
          <Text style={styles.sub}>Drag the map so the pin sits on your building</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        {initial ? (
          <MapPinPicker
            initialLat={initial.lat}
            initialLng={initial.lng}
            onCenterChange={onCenterChange}
            onMapError={setMapError}
            style={styles.map}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.playportOrange} />
            <Text style={styles.loadingText}>Finding you…</Text>
          </View>
        )}
      </View>

      <View style={[styles.sheet, { paddingHorizontal: horizontalPadding }]}>
        {mapError ? (
          <>
            <Text style={styles.sheetError}>{mapError}</Text>
            <Text style={styles.sheetSub}>
              You can still search the address or use GPS in the address form.
            </Text>
            <Button title="Back to address form" variant="secondary" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <View style={styles.previewRow}>
              <Ionicons name="location" size={20} color={colors.playportOrange} />
              <View style={{ flex: 1 }}>
                {resolving && !resolved ? (
                  <Text style={styles.sheetSub}>Reading this spot…</Text>
                ) : resolved ? (
                  <>
                    <Text style={styles.sheetTitle} numberOfLines={2}>
                      {resolved.line1}
                      {resolved.area ? `, ${resolved.area}` : ''}
                    </Text>
                    <Text style={styles.sheetSub} numberOfLines={1}>
                      {resolved.city}
                      {resolved.pincode ? ` · ${resolved.pincode}` : ''}
                      {resolving ? ' · updating…' : ''}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.sheetSub}>Move the map to read the address here.</Text>
                )}
              </View>
            </View>
            <Button title="Confirm this spot" disabled={!center} onPress={onConfirm} />
            <Text style={styles.hint}>
              Flat, floor & landmark come next — the pin is what guides your rider.
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 1 },
  mapWrap: { flex: 1, minHeight: 0 },
  map: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body },
  sheet: {
    gap: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.page,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  sheetTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  sheetSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  sheetError: { color: colors.danger, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  hint: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 11, textAlign: 'center' },
});
