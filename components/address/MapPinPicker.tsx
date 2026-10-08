import { Platform } from 'react-native';
import type { MapPinPickerProps } from './MapPinPickerTypes';

export type { MapPinPickerProps };

// Platform file is chosen at runtime so the native bundle never executes the
// web Maps JS code (and vice versa).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Impl = (Platform.OS === 'web'
  ? require('./MapPinPicker.web').MapPinPicker
  : require('./MapPinPicker.native').MapPinPicker) as (props: MapPinPickerProps) => React.JSX.Element;

export const MapPinPicker = Impl;
