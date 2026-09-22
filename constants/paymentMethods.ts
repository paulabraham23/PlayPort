/** Static checkout rails — not catalog/demo data. */
import type { PaymentMethod } from '@/types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-upi',
    type: 'upi',
    label: 'UPI Apps',
    subtitle: 'Google Pay, PhonePe, Paytm, CRED UPI',
    recommended: true,
  },
  {
    id: 'pay-card',
    type: 'card',
    label: 'Credit / Debit Cards',
    subtitle: 'Visa, Mastercard, RuPay — tokenized at checkout',
  },
  {
    id: 'pay-net',
    type: 'netbanking',
    label: 'Net Banking',
    subtitle: 'HDFC, ICICI, SBI, Axis & 40+ others',
  },
];
