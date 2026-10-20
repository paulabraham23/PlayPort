/** Static checkout rails — not catalog/demo data. */
import type { PaymentMethod } from '@/types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-online',
    type: 'online',
    label: 'Pay online',
    subtitle: 'UPI, cards, net banking & wallets — secured by Razorpay',
    recommended: true,
  },
  {
    id: 'pay-cod',
    type: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Pay the rider when your kit is handed over',
  },
];
