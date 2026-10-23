import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

/** Line shown under "Delivery" while there's no figure for the address yet. */
export function deliveryNoteFor(status: ReturnType<typeof useAppStore.getState>['deliveryQuoteStatus']) {
  switch (status) {
    case 'loading':
      return 'Working out distance from the hub…';
    case 'needsPin':
      return 'Pin your address on the map to see the charge';
    case 'error':
      return 'Couldn’t work out the distance — try again at checkout';
    default:
      return 'Free within 5 km of the hub; further away is charged per km';
  }
}

/** Keeps the delivery charge in step with the selected address and its map pin. */
export function useDeliveryQuote() {
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);
  const status = useAppStore((s) => s.deliveryQuoteStatus);
  const quote = useAppStore((s) => s.deliveryQuote);
  const error = useAppStore((s) => s.deliveryQuoteError);
  const refresh = useAppStore((s) => s.refreshDeliveryQuote);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  const pinKey = address ? `${address.id}:${address.lat ?? ''},${address.lng ?? ''}` : '';

  useEffect(() => {
    if (!isAuthenticated) return;
    void refresh();
  }, [pinKey, isAuthenticated, refresh]);

  return { address, status, quote, error, refresh };
}
