import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { OutOfAreaNotice } from '@/components/address/OutOfAreaNotice';
import { spacing } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { isInServiceArea } from '@/utils/serviceArea';

/** Home warning when the active delivery address is outside Hyderabad. */
export function ServiceAreaBanner() {
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);
  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault);
  if (!address || isInServiceArea(address)) return null;
  return (
    <View style={styles.wrap}>
      <OutOfAreaNotice
        place={[address.area, address.city].filter(Boolean).join(', ')}
        actionLabel="Change address"
        onAction={() => router.push({ pathname: '/address', params: { select: '1' } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
});
