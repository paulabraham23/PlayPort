import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { CartItem, Order, PaymentStatus } from '@/types';

const functions = getFunctions(firebaseApp, 'asia-south1');

if (process.env.EXPO_PUBLIC_USE_EMULATORS === '1') {
  const host =
    process.env.EXPO_PUBLIC_EMULATOR_HOST ??
    (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');
  connectFunctionsEmulator(functions, host, 5001);
}

export type CreateBookingInput = {
  hubId?: string;
  cart: CartItem[];
  addressLabel: string;
  addressFull: string;
  paymentMethodLabel: string;
  subtotal: number;
  taxes: number;
  total: number;
  startAt?: string;
};

export type CreateBookingResult = {
  orderId: string;
  order: Order;
  holdExpiresAt: string;
};

export type CreateRazorpayOrderResult = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  demo?: boolean;
};

export async function callCreateBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const fn = httpsCallable<CreateBookingInput, CreateBookingResult>(functions, 'createBooking');
  const res = await fn(input);
  return res.data;
}

export async function callConfirmPayment(orderId: string, fail = false) {
  const fn = httpsCallable<
    { orderId: string; fail?: boolean; provider?: 'demo' | 'razorpay' },
    { ok: boolean; paymentStatus: PaymentStatus; error?: string }
  >(functions, 'confirmPayment');
  const res = await fn({ orderId, fail, provider: 'demo' });
  return res.data;
}

/** @deprecated use callConfirmPayment */
export async function callConfirmPaymentDemo(orderId: string, fail = false) {
  return callConfirmPayment(orderId, fail);
}

export async function callCancelBooking(orderId: string, reason?: string) {
  const fn = httpsCallable<{ orderId: string; reason?: string }, { ok: boolean }>(
    functions,
    'cancelBooking'
  );
  const res = await fn({ orderId, reason });
  return res.data;
}

export async function callUpdateOrderStatus(orderId: string, status: string) {
  const fn = httpsCallable<{ orderId: string; status: string }, { ok: boolean; status: string }>(
    functions,
    'updateOrderStatus'
  );
  const res = await fn({ orderId, status });
  return res.data;
}

export async function callCompleteReturn(orderId: string) {
  const fn = httpsCallable<{ orderId: string }, { ok: boolean }>(functions, 'completeReturn');
  const res = await fn({ orderId });
  return res.data;
}

export async function callReleaseExpiredHolds() {
  const fn = httpsCallable<Record<string, never>, { releasedReservations: number }>(
    functions,
    'releaseExpiredInventoryHold'
  );
  const res = await fn({});
  return res.data;
}

export async function callCreateRazorpayOrder(orderId: string): Promise<CreateRazorpayOrderResult> {
  const fn = httpsCallable<{ orderId: string }, CreateRazorpayOrderResult>(
    functions,
    'createRazorpayOrder'
  );
  const res = await fn({ orderId });
  return res.data;
}

export async function callRegisterFcmToken(token: string) {
  const fn = httpsCallable<{ token: string }, { ok: boolean }>(functions, 'registerFcmToken');
  const res = await fn({ token });
  return res.data;
}

export async function callCheckAvailability(input: {
  productId: string;
  hubId?: string;
  startAt: string;
  endAt: string;
  quantity?: number;
}) {
  const fn = httpsCallable<typeof input, { ok: boolean; hubId: string; availableUnitIds: string[] }>(
    functions,
    'checkAvailability'
  );
  const res = await fn(input);
  return res.data;
}
