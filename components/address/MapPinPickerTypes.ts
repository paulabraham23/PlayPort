import type { ViewStyle } from 'react-native';

export interface MapPinPickerProps {
  initialLat: number;
  initialLng: number;
  /** Fired (debounced) as the map moves under the fixed center pin. */
  onCenterChange: (center: { lat: number; lng: number }) => void;
  /** Web-only: map library failed to load. Native renders its own error UI. */
  onMapError?: (message: string) => void;
  style?: ViewStyle;
}
