import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { colors, shadows } from '@/constants/theme';
import type { MapPinPickerProps } from './MapPinPickerTypes';

/**
 * Zepto-style map: the pin stays fixed at the center, the map moves under it.
 * Native implementation (Google Maps on Android, Apple Maps on iOS).
 */
export function MapPinPicker({ initialLat, initialLng, onCenterChange, style }: MapPinPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [recentering, setRecentering] = useState(false);

  const onRegionChangeComplete = (region: Region) => {
    onCenterChange({ lat: region.latitude, lng: region.longitude });
  };

  const recenter = async () => {
    setRecentering(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      mapRef.current?.animateToRegion(
        {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        },
        400
      );
    } catch {
      // stay where we are
    } finally {
      setRecentering(false);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: initialLat,
          longitude: initialLng,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
      />
      {/* Fixed center pin — pointerEvents lets map gestures pass through. */}
      <View style={styles.pinOverlay} pointerEvents="none">
        <View style={styles.pinShadow}>
          <Ionicons name="location" size={44} color={colors.playportOrange} />
        </View>
        <View style={styles.pinDot} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to my location"
        onPress={() => void recenter()}
        style={styles.recenterBtn}
      >
        {recentering ? (
          <ActivityIndicator size="small" color={colors.playportOrange} />
        ) : (
          <Ionicons name="locate" size={20} color={colors.playportOrange} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  pinOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    marginBottom: 26,
    ...shadows.soft,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
});
