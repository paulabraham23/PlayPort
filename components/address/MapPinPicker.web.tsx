import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';
import type { MapPinPickerProps } from './MapPinPickerTypes';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

let scriptPromise: Promise<void> | null = null;

function loadMapsScript(): Promise<void> {
  if (typeof document === 'undefined') return Promise.reject(new Error('No document'));
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (!MAPS_KEY) {
      reject(new Error('Address map isn’t configured yet (missing Maps key).'));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&loading=async&callback=__ppMapsReady`;
    script.async = true;
    script.defer = true;
    (window as unknown as Record<string, unknown>).__ppMapsReady = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Couldn’t load the map — check your connection.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Zepto-style map for web: fixed center pin, map moves under it.
 * Same props/events as the native picker.
 */
export function MapPinPicker({ initialLat, initialLng, onCenterChange, onMapError, style }: MapPinPickerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<{ getCenter: () => { lat: () => number; lng: () => number }; panTo: (p: { lat: number; lng: number }) => void; addListener: (e: string, fn: () => void) => void } | null>(null);
  const centerRef = useRef({ lat: initialLat, lng: initialLng });
  const cbRef = useRef(onCenterChange);
  cbRef.current = onCenterChange;
  const errRef = useRef(onMapError);
  errRef.current = onMapError;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let listener: any = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    void loadMapsScript()
      .then(() => {
        if (cancelled || !hostRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as unknown as any).google;
        if (!g?.maps) throw new Error('Map library failed to load.');
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';
        hostRef.current.appendChild(div);
        map = new g.maps.Map(div, {
          center: centerRef.current,
          zoom: 17,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });
        mapRef.current = map;
        listener = map.addListener('center_changed', () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            const c = map.getCenter();
            if (!c) return;
            const next = { lat: c.lat(), lng: c.lng() };
            centerRef.current = next;
            cbRef.current(next);
          }, 350);
        });
        cbRef.current(centerRef.current);
      })
      .catch((e: unknown) => {
        errRef.current?.(e instanceof Error ? e.message : 'Couldn’t load the map.');
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      try {
        listener?.remove?.();
      } catch {
        /* noop */
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recenter = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      errRef.current?.('Geolocation isn’t available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => errRef.current?.('Couldn’t get your location — drag the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <View style={[styles.wrap, style]}>
      {/* Map canvas mounts here. */}
      <View
        ref={(el) => {
          hostRef.current = (el as unknown as HTMLDivElement) ?? null;
        }}
        style={styles.canvas}
      />
      {/* Fixed center pin (pure views — no SVG dep). */}
      <View style={styles.pinOverlay} pointerEvents="none">
        <View style={styles.pinHead}>
          <View style={styles.pinHole} />
        </View>
        <View style={styles.pinTip} />
        <View style={styles.pinDot} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to my location"
        onPress={recenter}
        style={styles.recenterBtn}
      >
        <Text style={styles.recenterGlyph}>◎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  canvas: { ...StyleSheet.absoluteFill },
  pinOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pinHole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
  },
  pinTip: {
    width: 14,
    height: 14,
    backgroundColor: colors.playportOrange,
    transform: [{ rotate: '45deg' }],
    marginTop: -21,
    marginBottom: 7,
  },
  pinDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.playportOrange,
    borderWidth: 2,
    borderColor: colors.white,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterGlyph: { color: colors.playportOrange, fontSize: 20, lineHeight: 22 },
});
