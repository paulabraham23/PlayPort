import { createHmac, randomBytes } from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type DocumentData, type DocumentReference } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineString } from 'firebase-functions/params';
import {
  cartItemHours,
  expectedLineTotal,
  normalizeFnProduct,
  priceForAddon,
  priceForHourly,
  type FnCartItem,
  type FnProduct,
} from './rentalPricing';

initializeApp();
const db = getFirestore();

const REGION = 'asia-south1';
/** Payment hold TTL before inventory is released automatically. */
const HOLD_TTL_MS = 15 * 60 * 1000;

const ORDER_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['cancelled'],
  confirmed: ['preparing', 'cancelled', 'refunded'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['active', 'returning'],
  active: ['returning'],
  returning: ['completed'],
  completed: [],
  cancelled: [],
  refunded: [],
};

const razorpayKeyId = defineString('RAZORPAY_KEY_ID', { default: '' });
/** Optional — empty = demo checkout (confirmPayment). Set via params when going live. */
const razorpayKeySecret = defineString('RAZORPAY_KEY_SECRET', { default: '' });
const razorpayWebhookSecret = defineString('RAZORPAY_WEBHOOK_SECRET', { default: '' });
const googleMapsApiKey = defineString('GOOGLE_MAPS_API_KEY', { default: '' });

type CartItem = FnCartItem & {
  id: string;
  name: string;
  image: string;
  durationLabel: string;
  includesNote?: string;
};

function requireAuth(uid: string | undefined): string {
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');
  return uid;
}

function orderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `PP-${new Date().getFullYear()}-${n}`;
}

function formatInIndia(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

async function clearUserCart(uid: string) {
  const cartSnap = await db.collection('users').doc(uid).collection('cart').get();
  await Promise.all(cartSnap.docs.map((d) => d.ref.delete()));
}

function lineClientTotal(c: CartItem): number {
  const extras = c.addonsTotal ?? (c.addons ?? []).reduce((s, a) => s + a.unitPrice * a.quantity, 0);
  return (c.unitPrice + extras) * c.quantity;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function isActiveReservation(
  status: string,
  holdExpiresAt: string | null | undefined,
  now: number
) {
  if (status === 'confirmed') return true;
  if (status === 'hold') {
    if (!holdExpiresAt) return true;
    return new Date(holdExpiresAt).getTime() > now;
  }
  return false;
}

async function pushNotification(
  userId: string,
  payload: { title: string; body: string; type: string; orderId?: string }
) {
  const ref = db.collection('users').doc(userId).collection('notifications').doc();
  const createdAt = new Date().toISOString();
  await ref.set({
    id: ref.id,
    title: payload.title,
    body: payload.body,
    type: payload.type,
    orderId: payload.orderId ?? null,
    read: false,
    createdAt,
    timeLabel: 'Just now',
  });

  const userSnap = await db.collection('users').doc(userId).get();
  const tokens: string[] = userSnap.data()?.fcmTokens ?? [];
  if (!tokens.length) return;

  try {
    await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: { type: payload.type, orderId: payload.orderId ?? '' },
    });
  } catch (err) {
    logger.warn('FCM send failed', err);
  }
}

async function resolveHubId(requested?: string, userId?: string): Promise<string> {
  if (requested) {
    const snap = await db.collection('hubs').doc(requested).get();
    if (snap.exists && snap.data()?.active !== false) return snap.id;
  }
  if (userId) {
    const user = await db.collection('users').doc(userId).get();
    const homeHubId = user.data()?.homeHubId as string | undefined;
    if (homeHubId) {
      const snap = await db.collection('hubs').doc(homeHubId).get();
      if (snap.exists && snap.data()?.active !== false) return snap.id;
    }
  }
  const active = await db.collection('hubs').where('active', '==', true).limit(1).get();
  if (active.empty) throw new HttpsError('failed-precondition', 'No active hub configured');
  return active.docs[0].id;
}

async function unitHasOverlap(
  unitId: string,
  startMs: number,
  endMs: number,
  now: number,
  excludeOrderId?: string
): Promise<boolean> {
  const snap = await db
    .collection('inventory_reservations')
    .where('inventoryUnitId', '==', unitId)
    .where('status', 'in', ['hold', 'confirmed'])
    .get();

  for (const doc of snap.docs) {
    const r = doc.data();
    if (excludeOrderId && r.orderId === excludeOrderId) continue;
    if (!isActiveReservation(r.status, r.holdExpiresAt, now)) continue;
    const rStart = new Date(r.startAt).getTime();
    const rEnd = new Date(r.endAt).getTime();
    if (rangesOverlap(startMs, endMs, rStart, rEnd)) return true;
  }
  return false;
}

async function pickUnitsForProduct(
  productId: string,
  hubId: string,
  quantity: number,
  startMs: number,
  endMs: number,
  now: number,
  preferredUnitIds: string[] = []
): Promise<string[]> {
  const unitsSnap = await db
    .collection('inventory_units')
    .where('productId', '==', productId)
    .where('hubId', '==', hubId)
    .where('status', '==', 'available')
    .get();

  const preferred = new Set(preferredUnitIds.filter(Boolean));
  const docs = [...unitsSnap.docs].sort((a, b) => {
    const rank = (id: string) => (preferred.has(id) ? 0 : 1);
    return rank(a.id) - rank(b.id);
  });

  const picked: string[] = [];
  for (const doc of docs) {
    if (picked.length >= quantity) break;
    const busy = await unitHasOverlap(doc.id, startMs, endMs, now);
    if (!busy) picked.push(doc.id);
  }
  if (preferred.size > 0 && !picked.some((id) => preferred.has(id))) {
    throw new HttpsError(
      'failed-precondition',
      'The unit you chose is not free for that window'
    );
  }
  if (picked.length < quantity) {
    throw new HttpsError(
      'resource-exhausted',
      `Not enough free units for ${productId} in the selected window`
    );
  }
  return picked;
}

async function releaseReservations(reservationIds: string[], toStatus: 'released' | 'completed') {
  const nowIso = new Date().toISOString();
  await Promise.all(
    reservationIds.map(async (id) => {
      const ref = db.collection('inventory_reservations').doc(id);
      const snap = await ref.get();
      if (!snap.exists) return;
      const status = snap.data()?.status;
      if (status === 'released' || status === 'completed') return;
      await ref.update({ status: toStatus, holdExpiresAt: null, updatedAt: nowIso });
    })
  );
}

async function markOrderPaymentFailedOrCancelled(
  orderRef: DocumentReference,
  order: DocumentData,
  reason: string
) {
  const reservationIds: string[] = order.reservationIds ?? [];
  await releaseReservations(reservationIds, 'released');
  await orderRef.update({
    status: 'cancelled',
    paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed',
    holdExpiresAt: null,
    progressPercent: 0,
    cancelReason: reason,
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// ——— createBooking ———

export const createBooking = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const {
    hubId: requestedHubId,
    cart,
    addressLabel,
    addressFull,
    dropoffLat: dropoffLatInput,
    dropoffLng: dropoffLngInput,
    paymentMethodLabel,
    subtotal,
    taxes,
    total,
    startAt: startAtInput,
  } = request.data as {
    hubId?: string;
    cart: CartItem[];
    addressLabel: string;
    addressFull: string;
    dropoffLat?: number;
    dropoffLng?: number;
    paymentMethodLabel: string;
    subtotal: number;
    taxes: number;
    total: number;
    startAt?: string;
  };

  if (!Array.isArray(cart) || !cart.length) {
    throw new HttpsError('invalid-argument', 'Cart is empty');
  }
  if (!addressFull || String(addressFull).trim().length < 8) {
    throw new HttpsError('invalid-argument', 'Delivery address required');
  }

  const hubId = await resolveHubId(requestedHubId, uid);
  const now = Date.now();
  const startAt = startAtInput ? new Date(startAtInput) : new Date(now + 45 * 60 * 1000);
  if (Number.isNaN(startAt.getTime())) {
    throw new HttpsError('invalid-argument', 'Invalid startAt');
  }
  // Service hours (IST): dropoffs run 8 AM – midnight. Scheduled starts must
  // land inside the window; the session itself may run overnight (e.g. 4 PM – 4 AM).
  if (startAt.getTime() < now - 5 * 60 * 1000) {
    throw new HttpsError('invalid-argument', 'That slot already passed — pick a new time');
  }
  if (startAt.getTime() > now + 8 * 24 * 60 * 60 * 1000) {
    throw new HttpsError('invalid-argument', 'Bookings open up to 7 days ahead');
  }
  const startIstHour = new Date(startAt.getTime() + 5.5 * 60 * 60 * 1000).getUTCHours();
  if (startIstHour < 8 || startIstHour >= 24) {
    throw new HttpsError(
      'failed-precondition',
      'We’re closed 12–8 AM. Schedule your dropoff from 8 AM onwards.'
    );
  }

  // Server-side reprice for product lines
  let expectedSubtotal = 0;
  for (const line of cart) {
    if (line.experienceId && !line.productId) {
      const expSnap = await db.collection('experiences').doc(line.experienceId).get();
      if (!expSnap.exists) {
        throw new HttpsError('not-found', `Combo ${line.name || line.experienceId} not found`);
      }
      const expData = expSnap.data()!;
      const plans = (expData?.plans ?? []) as { id?: string; hours?: number; price?: number }[];
      const expAddons = (expData?.addons ?? []) as {
        id: string;
        name: string;
        maxQuantity: number;
        pricing: { perHour: number; perHourMaxPlanHours: number; flatPrice: number; flatMinPlanHours: number; tiers?: { upToHours: number; price: number; mode?: 'flat' | 'hourly' }[] };
      }[];
      const lineHours = line.hours ?? 12;
      let expectedAddons = 0;
      for (const a of line.addons ?? []) {
        const addon = expAddons.find((x) => x.id === a.id);
        if (!addon) {
          throw new HttpsError(
            'failed-precondition',
            `Extra ${a.name || a.id} is not offered on ${line.name || line.experienceId}`
          );
        }
        if (a.quantity > addon.maxQuantity) {
          throw new HttpsError(
            'failed-precondition',
            `Only ${addon.maxQuantity}× ${addon.name} allowed`
          );
        }
        expectedAddons += priceForAddon(addon, lineHours, a.quantity);
      }
      if (plans.length) {
        const plan =
          plans.find((p) => p.id && p.id === line.planId) ??
          plans.find((p) => p.hours === line.hours);
        const expected = (Number(plan?.price) || 0) * (line.quantity || 1) + expectedAddons * (line.quantity || 1);
        if (!plan || Math.abs(lineClientTotal(line) - expected) > 1) {
          throw new HttpsError(
            'failed-precondition',
            `Price mismatch for ${line.name || line.experienceId}`
          );
        }
      } else if (Math.abs(lineClientTotal(line) - (line.unitPrice * (line.quantity || 1) + expectedAddons * (line.quantity || 1))) > 1) {
        throw new HttpsError(
          'failed-precondition',
          `Price mismatch for ${line.name || line.experienceId}`
        );
      }
      expectedSubtotal += lineClientTotal(line);
      continue;
    }
    if (!line.productId) {
      throw new HttpsError('invalid-argument', 'Cart line missing productId');
    }
    const snap = await db.collection('products').doc(line.productId).get();
    if (!snap.exists) {
      throw new HttpsError('not-found', `Product ${line.productId} not found`);
    }
    const product = snap.data() as FnProduct;
    const expected = expectedLineTotal(product, line);
    const client = lineClientTotal(line);
    if (Math.abs(expected - client) > 1) {
      throw new HttpsError(
        'failed-precondition',
        `Price mismatch for ${line.name || line.productId}: expected ₹${expected}, got ₹${client}`
      );
    }
    expectedSubtotal += expected;
  }
  if (typeof subtotal === 'number' && Math.abs(expectedSubtotal - subtotal) > 1) {
    throw new HttpsError(
      'failed-precondition',
      `Cart subtotal mismatch: expected ₹${expectedSubtotal}, got ₹${subtotal}`
    );
  }

  const maxHours = Math.max(...cart.map((c) => cartItemHours(c)));
  const endAt = new Date(startAt.getTime() + maxHours * 60 * 60 * 1000);
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();
  const holdExpiresAt = new Date(now + HOLD_TTL_MS).toISOString();
  const startIso = startAt.toISOString();
  const endIso = endAt.toISOString();
  const nowIso = new Date().toISOString();

  // Expand combo/experience lines into product inventory holds
  const productLines: CartItem[] = [];
  for (const line of cart) {
    if (line.productId) {
      productLines.push(line);
      continue;
    }
    if (line.experienceId) {
      const expSnap = await db.collection('experiences').doc(line.experienceId).get();
      const productIds: string[] = expSnap.exists
        ? ((expSnap.data()?.productIds as string[]) ?? [])
        : [];
      if (!productIds.length) {
        throw new HttpsError(
          'failed-precondition',
          `Combo ${line.name} has no linked products for inventory`
        );
      }
      for (const productId of productIds) {
        productLines.push({ ...line, productId, quantity: line.quantity || 1 });
      }
    }
  }

  const unitAssignments: { productId: string; unitId: string }[] = [];

  for (const line of productLines) {
    const unitIds = await pickUnitsForProduct(
      line.productId!,
      hubId,
      line.quantity,
      startMs,
      endMs,
      now,
      line.inventoryUnitId ? [line.inventoryUnitId] : []
    );
    for (const unitId of unitIds) {
      unitAssignments.push({ productId: line.productId!, unitId });
    }
  }

  // Re-check inside a batch write for race safety (second pass)
  for (const a of unitAssignments) {
    const busy = await unitHasOverlap(a.unitId, startMs, endMs, Date.now());
    if (busy) {
      throw new HttpsError('aborted', 'Inventory changed — retry checkout');
    }
  }

  const id = orderId();
  const reservationIds: string[] = [];
  const batch = db.batch();
  for (const a of unitAssignments) {
    const resRef = db.collection('inventory_reservations').doc();
    reservationIds.push(resRef.id);
    batch.set(resRef, {
      id: resRef.id,
      inventoryUnitId: a.unitId,
      productId: a.productId,
      hubId,
      orderId: id,
      userId: uid,
      startAt: startIso,
      endAt: endIso,
      status: 'hold',
      holdExpiresAt,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  const order = {
    id,
    userId: uid,
    hubId,
    status: 'pending_payment' as const,
    paymentStatus: 'pending' as const,
    createdAt: nowIso,
    updatedAt: nowIso,
    holdExpiresAt,
    startAt: startIso,
    endAt: endIso,
    reservationIds,
    etaLabel:
      startAt.getTime() - now > 3 * 60 * 60 * 1000 ? 'Scheduled dropoff' : 'Complete payment to confirm',
    addressLabel,
    addressFull,
    items: cart.map((c) => ({
      productId: c.productId ?? null,
      experienceId: c.experienceId ?? null,
      name: c.name,
      image: c.image,
      durationLabel: c.durationLabel,
      returnLabel: `Returns ${formatInIndia(endAt)}`,
      price: lineClientTotal(c),
      badges: [...(c.includesNote ? [c.includesNote.slice(0, 28)] : [])],
      extras: (c.addons ?? [])
        .filter((a) => a.quantity > 0)
        .map((a) => `${a.quantity}× ${a.name} · ₹${a.unitPrice} each`),
    })),
    subtotal,
    taxes,
    total,
    paymentMethodLabel,
    progressPercent: 10,
    setupIncluded: true,
    liveDispatch: false,
    riderId: null,
    // Exact delivery pin from the saved address (Zepto-style) — rider
    // navigates to these coords instead of a fuzzy text search.
    ...(Number.isFinite(dropoffLatInput) &&
    Number.isFinite(dropoffLngInput) &&
    Math.abs(dropoffLatInput as number) <= 90 &&
    Math.abs(dropoffLngInput as number) <= 180
      ? { dropoffLat: dropoffLatInput, dropoffLng: dropoffLngInput }
      : {}),
    // 4-digit handover code — customer reads it to the rider before mark-delivered.
    deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
  };

  batch.set(db.collection('orders').doc(id), order);
  await batch.commit();

  await pushNotification(uid, {
    title: 'Booking held',
    body: `${id} is reserved for 15 minutes — complete payment to confirm.`,
    type: 'order',
    orderId: id,
  });

  return { orderId: id, order, holdExpiresAt };
});

// ——— confirmPayment ———

export const confirmPayment = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId: id, fail, provider = 'demo', providerRef } = request.data as {
    orderId: string;
    fail?: boolean;
    provider?: 'demo' | 'razorpay';
    providerRef?: string;
  };
  if (!id) throw new HttpsError('invalid-argument', 'orderId required');

  const ref = db.collection('orders').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data()!;
  if (order.userId !== uid) throw new HttpsError('permission-denied', 'Not your order');

  if (fail) {
    await markOrderPaymentFailedOrCancelled(ref, order, 'Payment failed');
    await pushNotification(uid, {
      title: 'Payment failed',
      body: `${id} was not paid. Inventory hold released.`,
      type: 'payment',
      orderId: id,
    });
    return { ok: false, paymentStatus: 'failed' as const, error: 'Payment could not be completed' };
  }

  if (order.paymentStatus === 'paid') {
    return { ok: true, paymentStatus: 'paid' as const };
  }

  const holdExp = order.holdExpiresAt ? new Date(order.holdExpiresAt).getTime() : 0;
  if (holdExp && holdExp < Date.now() && order.paymentStatus === 'pending') {
    await markOrderPaymentFailedOrCancelled(ref, order, 'Hold expired');
    throw new HttpsError('deadline-exceeded', 'Payment hold expired — start checkout again');
  }

  const paymentId = providerRef || `${provider}_${randomBytes(6).toString('hex')}`;
  const nowIso = new Date().toISOString();

  await db.collection('payments').doc(paymentId).set({
    id: paymentId,
    orderId: id,
    userId: uid,
    amount: order.total,
    currency: 'INR',
    provider,
    providerRef: paymentId,
    status: 'paid',
    createdAt: nowIso,
  });

  const reservationIds: string[] = order.reservationIds ?? [];
  await Promise.all(
    reservationIds.map((rid) =>
      db.collection('inventory_reservations').doc(rid).update({
        status: 'confirmed',
        holdExpiresAt: null,
        updatedAt: nowIso,
      })
    )
  );

  await ref.update({
    paymentStatus: 'paid',
    status: 'confirmed',
    holdExpiresAt: null,
    progressPercent: 20,
    updatedAt: nowIso,
    ...(provider === 'demo'
      ? { paymentMethodLabel: '', paymentProvider: 'demo' }
      : { paymentProvider: 'razorpay' }),
  });

  await clearUserCart(uid);

  await pushNotification(uid, {
    title: 'Payment received',
    body: `${id} is confirmed and being packed.`,
    type: 'payment',
    orderId: id,
  });

  return { ok: true, paymentStatus: 'paid' as const };
});

/** @deprecated Prefer confirmPayment */
export const confirmPaymentDemo = confirmPayment;

// ——— cancelBooking ———

export const cancelBooking = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId: id, reason } = request.data as { orderId: string; reason?: string };
  if (!id) throw new HttpsError('invalid-argument', 'orderId required');

  const ref = db.collection('orders').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data()!;
  if (order.userId !== uid) throw new HttpsError('permission-denied', 'Not your order');
  if (['cancelled', 'completed', 'refunded'].includes(order.status)) {
    throw new HttpsError('failed-precondition', 'Order already closed');
  }

  await releaseReservations(order.reservationIds ?? [], 'released');
  await ref.update({
    status: 'cancelled',
    paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
    holdExpiresAt: null,
    progressPercent: 0,
    cancelReason: reason ?? null,
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await pushNotification(uid, {
    title: 'Order cancelled',
    body: `${id} was cancelled. Inventory released.`,
    type: 'order',
    orderId: id,
  });

  return { ok: true };
});

// ——— updateOrderStatus ———

export const updateOrderStatus = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId: id, status } = request.data as { orderId: string; status: string };
  if (!id || !status) throw new HttpsError('invalid-argument', 'orderId and status required');

  const ref = db.collection('orders').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data()!;

  const isAdmin = request.auth?.token?.admin === true;
  if (!isAdmin && order.userId !== uid) {
    throw new HttpsError('permission-denied', 'Not allowed');
  }

  // Customers may only trigger returning → (via completeReturn) — limited self-service
  const allowedForCustomer = ['returning'];
  if (!isAdmin && !allowedForCustomer.includes(status)) {
    throw new HttpsError('permission-denied', 'Only ops can set this status');
  }

  const from = order.status as string;
  const next = ORDER_TRANSITIONS[from] ?? [];
  if (!next.includes(status)) {
    throw new HttpsError('failed-precondition', `Cannot transition ${from} → ${status}`);
  }
  if (order.paymentStatus !== 'paid' && !['cancelled', 'refunded'].includes(status)) {
    throw new HttpsError('failed-precondition', 'Order is not paid');
  }

  const progress: Record<string, number> = {
    preparing: 35,
    out_for_delivery: 55,
    delivered: 70,
    active: 85,
    returning: 92,
    completed: 100,
  };

  await ref.update({
    status,
    progressPercent: progress[status] ?? order.progressPercent,
    updatedAt: new Date().toISOString(),
  });

  return { ok: true, status };
});

// ——— completeReturn ———

export const completeReturn = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId: id } = request.data as { orderId: string };
  if (!id) throw new HttpsError('invalid-argument', 'orderId required');

  const ref = db.collection('orders').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data()!;
  const riderSnap = await db.collection('riders').doc(uid).get();
  const isAssignedRider =
    riderSnap.exists && riderSnap.data()?.active === true && order.riderId === uid;
  if (order.userId !== uid && request.auth?.token?.admin !== true && !isAssignedRider) {
    throw new HttpsError('permission-denied', 'Not your order');
  }

  await releaseReservations(order.reservationIds ?? [], 'completed');
  await ref.update({
    status: 'completed',
    progressPercent: 100,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await pushNotification(order.userId, {
    title: 'Return complete',
    body: `${id} is closed. Thanks for renting with PlayPort.`,
    type: 'order',
    orderId: id,
  });

  return { ok: true };
});

// ——— releaseExpiredInventoryHold ———

async function releaseExpiredHoldsInternal() {
  const nowIso = new Date().toISOString();
  const snap = await db
    .collection('inventory_reservations')
    .where('status', '==', 'hold')
    .where('holdExpiresAt', '<=', nowIso)
    .limit(200)
    .get();

  const orderIds = new Set<string>();
  for (const doc of snap.docs) {
    orderIds.add(doc.data().orderId as string);
    await doc.ref.update({
      status: 'released',
      holdExpiresAt: null,
      updatedAt: nowIso,
    });
  }

  for (const oid of orderIds) {
    const orderRef = db.collection('orders').doc(oid);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) continue;
    const order = orderSnap.data()!;
    if (order.paymentStatus !== 'pending') continue;
    await orderRef.update({
      status: 'cancelled',
      paymentStatus: 'failed',
      holdExpiresAt: null,
      progressPercent: 0,
      cancelReason: 'Payment hold expired',
      cancelledAt: nowIso,
      updatedAt: nowIso,
    });
    if (order.userId) {
      await pushNotification(order.userId, {
        title: 'Hold expired',
        body: `${oid} was released after payment timed out.`,
        type: 'order',
        orderId: oid,
      });
    }
  }

  return { releasedReservations: snap.size, ordersTouched: orderIds.size };
}

export const releaseExpiredInventoryHold = onCall({ region: REGION }, async (request) => {
  requireAuth(request.auth?.uid);
  return releaseExpiredHoldsInternal();
});

export const releaseExpiredInventoryHoldSchedule = onSchedule(
  { region: REGION, schedule: 'every 5 minutes' },
  async () => {
    const result = await releaseExpiredHoldsInternal();
    logger.info('Expired holds released', result);
  }
);

// ——— extendBooking ———

const EXTENDABLE_STATUSES = ['delivered', 'active'];
const EXTENSION_OPTIONS = [1, 2, 3, 6, 12];

function parseExtraQty(label: string): number {
  const m = label.match(/(\d+)\s*[×x]/);
  return m ? Number(m[1]) || 0 : 0;
}

function parseExtraName(label: string): string {
  const m = label.match(/[×x]\s*(.+?)\s*·/);
  return (m?.[1] ?? '').trim().toLowerCase();
}

/** Per-unit kit price for an extension chunk. Prefers hourly, then exact plan, else pro-rated plan rate. */
function extensionKitPrice(product: FnProduct, extraHours: number): number {
  const p = normalizeFnProduct(product);
  if (product.hourly?.enabled) return priceForHourly(product, extraHours);
  const exact = p.plans.find((x) => x.hours === extraHours);
  if (exact) return exact.price;
  const sorted = [...p.plans].filter((x) => x.price > 0).sort((a, b) => a.hours - b.hours);
  if (!sorted.length) return 0;
  const cover = sorted.find((x) => x.hours >= extraHours) ?? sorted[sorted.length - 1];
  return Math.round((cover.price / cover.hours) * extraHours);
}

async function computeExtensionQuote(orderId: string, extraHours: number) {
  if (!Number.isInteger(extraHours) || extraHours < 1 || extraHours > 24) {
    throw new HttpsError('invalid-argument', 'additionalHours must be 1–24');
  }
  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data()!;

  if (order.paymentStatus !== 'paid') {
    throw new HttpsError('failed-precondition', 'Order is not paid');
  }
  if (!EXTENDABLE_STATUSES.includes(order.status)) {
    throw new HttpsError('failed-precondition', 'Only live sessions can be extended');
  }
  if (!order.endAt) throw new HttpsError('failed-precondition', 'Order has no end time');

  const oldEndMs = new Date(order.endAt).getTime();
  if (Number.isNaN(oldEndMs)) throw new HttpsError('failed-precondition', 'Invalid order end time');
  const newEndMs = oldEndMs + extraHours * 60 * 60 * 1000;
  const newEndIso = new Date(newEndMs).toISOString();

  // Availability: every held unit must be free in [oldEnd, newEnd].
  const reservationIds: string[] = order.reservationIds ?? [];
  const now = Date.now();
  const unitIds: string[] = [];
  for (const rid of reservationIds) {
    const rSnap = await db.collection('inventory_reservations').doc(rid).get();
    const unitId = rSnap.data()?.inventoryUnitId as string | undefined;
    if (!unitId) continue;
    unitIds.push(unitId);
    const busy = await unitHasOverlap(unitId, oldEndMs, newEndMs, now, orderId);
    if (busy) {
      throw new HttpsError('resource-exhausted', 'Kit is already booked after your slot — try fewer hours');
    }
  }

  // Price per product group (units × kit rate + addons repriced for extra hours).
  const items: Array<{ productId?: string | null; name: string; price: number }> =
    order.items ?? [];
  const byProduct = new Map<string, number>();
  for (const rid of reservationIds) {
    const rSnap = await db.collection('inventory_reservations').doc(rid).get();
    const pid = rSnap.data()?.productId as string | undefined;
    if (pid) byProduct.set(pid, (byProduct.get(pid) ?? 0) + 1);
  }
  // Fallback for orders without reservations (legacy): one unit per product line.
  if (!byProduct.size) {
    for (const it of items) {
      if (it.productId) byProduct.set(it.productId as string, (byProduct.get(it.productId as string) ?? 0) + 1);
    }
  }

  let extSubtotal = 0;
  const perItem: Array<{ name: string; price: number }> = [];
  for (const it of items) {
    const pid = (it.productId as string | undefined) ?? undefined;
    const units = (pid && byProduct.get(pid)) || 1;
    // Split shared product units evenly across its lines.
    const linesForProduct = items.filter((x) => x.productId === it.productId).length || 1;
    const share = units / linesForProduct;
    let lineExt = 0;
    if (pid) {
      const pSnap = await db.collection('products').doc(pid).get();
      if (pSnap.exists) {
        const product = pSnap.data() as FnProduct;
        lineExt += extensionKitPrice(product, extraHours) * share;
        const catalog = normalizeFnProduct(product).addons ?? [];
        for (const extra of (it as { extras?: string[] }).extras ?? []) {
          const qty = parseExtraQty(extra);
          const nm = parseExtraName(extra);
          if (!qty || !nm) continue;
          const addon = catalog.find((a) => a.name.toLowerCase() === nm);
          if (addon) lineExt += priceForAddon(addon, extraHours, qty) * share;
        }
      } else {
        // Unknown product: pro-rate original line price.
        const origHours = Math.max(1, Math.round((oldEndMs - new Date(order.startAt).getTime()) / 3600000));
        lineExt += Math.round(((it.price ?? 0) / origHours) * extraHours);
      }
    } else {
      // Combo/experience line without product link: pro-rate.
      const origHours = Math.max(1, Math.round((oldEndMs - new Date(order.startAt).getTime()) / 3600000));
      lineExt += Math.round(((it.price ?? 0) / origHours) * extraHours);
    }
    lineExt = Math.round(lineExt);
    extSubtotal += lineExt;
    perItem.push({ name: it.name, price: lineExt });
  }

  extSubtotal = Math.round(extSubtotal);
  const taxes = Math.round(extSubtotal * 0.05);
  const total = extSubtotal + taxes;
  return { order, ref, oldEndMs, newEndMs, newEndIso, extSubtotal, taxes, total, perItem, unitIds, reservationIds };
}

export const getExtensionQuote = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId, additionalHours } = request.data as { orderId: string; additionalHours: number };
  if (!orderId) throw new HttpsError('invalid-argument', 'orderId required');
  const snap = await db.collection('orders').doc(orderId).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  if (snap.data()?.userId !== uid) throw new HttpsError('permission-denied', 'Not your order');
  const q = await computeExtensionQuote(orderId, additionalHours);
  return {
    ok: true,
    orderId,
    additionalHours,
    available: true,
    newEndAt: q.newEndIso,
    subtotal: q.extSubtotal,
    taxes: q.taxes,
    total: q.total,
    perItem: q.perItem,
    options: EXTENSION_OPTIONS,
  };
});

export const extendBooking = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { orderId: id, additionalHours, provider = 'demo' } = request.data as {
    orderId: string;
    additionalHours: number;
    provider?: 'demo' | 'razorpay';
  };
  if (!id) throw new HttpsError('invalid-argument', 'orderId required');

  const ref = db.collection('orders').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  if (snap.data()?.userId !== uid) throw new HttpsError('permission-denied', 'Not your order');

  const q = await computeExtensionQuote(id, additionalHours);
  const nowIso = new Date().toISOString();

  // Charge for the extension (demo inline; Razorpay keys → still recorded inline for now).
  const paymentId = `${provider}_${randomBytes(6).toString('hex')}`;
  await db.collection('payments').doc(paymentId).set({
    id: paymentId,
    orderId: id,
    userId: uid,
    amount: q.total,
    currency: 'INR',
    provider,
    providerRef: paymentId,
    status: 'paid',
    kind: 'extension',
    additionalHours,
    createdAt: nowIso,
  });

  await Promise.all(
    q.reservationIds.map((rid) =>
      db.collection('inventory_reservations').doc(rid).update({
        endAt: q.newEndIso,
        updatedAt: nowIso,
      })
    )
  );

  const order = q.order;
  const nextItems = (order.items ?? []).map((it: DocumentData, idx: number) => ({
    ...it,
    price: (it.price ?? 0) + (q.perItem[idx]?.price ?? 0),
    durationLabel: `${it.durationLabel} +${additionalHours}h ext`,
    returnLabel: `Returns ${formatInIndia(new Date(q.newEndMs))}`,
  }));

  const extensionRecord = {
    additionalHours,
    subtotal: q.extSubtotal,
    taxes: q.taxes,
    total: q.total,
    newEndAt: q.newEndIso,
    paymentId,
    createdAt: nowIso,
  };

  await ref.update({
    endAt: q.newEndIso,
    items: nextItems,
    subtotal: (order.subtotal ?? 0) + q.extSubtotal,
    taxes: (order.taxes ?? 0) + q.taxes,
    total: (order.total ?? 0) + q.total,
    extensions: FieldValue.arrayUnion(extensionRecord),
    updatedAt: nowIso,
  });

  await pushNotification(uid, {
    title: 'Session extended',
    body: `${id} extended by ${additionalHours}h — new return ${formatInIndia(new Date(q.newEndMs))}.`,
    type: 'order',
    orderId: id,
  });

  return { ok: true, orderId: id, newEndAt: q.newEndIso, extensionTotal: q.total };
});

// ——— Razorpay ———

export const createRazorpayOrder = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireAuth(request.auth?.uid);
    const { orderId: id } = request.data as { orderId: string };
    if (!id) throw new HttpsError('invalid-argument', 'orderId required');

    const snap = await db.collection('orders').doc(id).get();
    if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
    const order = snap.data()!;
    if (order.userId !== uid) throw new HttpsError('permission-denied', 'Not your order');

    const keyId = razorpayKeyId.value();
    const keySecret = razorpayKeySecret.value();

    if (!keyId || !keySecret) {
      return {
        orderId: id,
        razorpayOrderId: `demo_${id}`,
        amount: Math.round((order.total ?? 0) * 100),
        currency: 'INR',
        keyId: '',
        demo: true,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountPaise = Math.round((order.total ?? 0) * 100);
    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: id,
      notes: { orderId: id, userId: uid },
    });

    await db.collection('orders').doc(id).update({ razorpayOrderId: rzpOrder.id });
    await db.collection('payments').doc(rzpOrder.id).set({
      id: rzpOrder.id,
      orderId: id,
      userId: uid,
      amount: order.total,
      currency: 'INR',
      provider: 'razorpay',
      providerRef: rzpOrder.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return {
      orderId: id,
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId,
      demo: false,
    };
  }
);

async function confirmPaidOrderAdmin(orderId: string, providerRef: string) {
  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const order = snap.data()!;
  if (order.paymentStatus === 'paid') return;

  const nowIso = new Date().toISOString();
  const reservationIds: string[] = order.reservationIds ?? [];
  await Promise.all(
    reservationIds.map((rid) =>
      db.collection('inventory_reservations').doc(rid).update({
        status: 'confirmed',
        holdExpiresAt: null,
        updatedAt: nowIso,
      })
    )
  );
  await ref.update({
    paymentStatus: 'paid',
    status: 'confirmed',
    holdExpiresAt: null,
    progressPercent: 20,
    updatedAt: nowIso,
  });
  if (order.userId) await clearUserCart(order.userId);
  await pushNotification(order.userId, {
    title: 'Payment received',
    body: `${orderId} is confirmed and being packed.`,
    type: 'payment',
    orderId,
  });
  void providerRef;
}

export const razorpayWebhook = onRequest(
  { region: REGION },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const secret = razorpayWebhookSecret.value() || razorpayKeySecret.value();
    const signature = req.get('x-razorpay-signature') ?? '';
    const body = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body);
    const expected = createHmac('sha256', secret).update(body).digest('hex');

    if (secret && signature && expected !== signature) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderEntity = req.body?.payload?.order?.entity;

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id;
      if (razorpayOrderId) {
        const paySnap = await db.collection('payments').doc(razorpayOrderId).get();
        const orderIdFromPay = paySnap.data()?.orderId as string | undefined;
        const notesOrderId = orderEntity?.notes?.orderId as string | undefined;
        const id = orderIdFromPay ?? notesOrderId;
        if (id) {
          if (paySnap.exists) {
            await paySnap.ref.update({
              status: 'paid',
              providerRef: paymentEntity?.id ?? razorpayOrderId,
            });
          }
          await confirmPaidOrderAdmin(id, paymentEntity?.id ?? razorpayOrderId);
        }
      }
    }

    if (event === 'payment.failed') {
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        const paySnap = await db.collection('payments').doc(razorpayOrderId).get();
        const id = paySnap.data()?.orderId as string | undefined;
        if (id) {
          const orderRef = db.collection('orders').doc(id);
          const orderSnap = await orderRef.get();
          if (orderSnap.exists) {
            await markOrderPaymentFailedOrCancelled(
              orderRef,
              orderSnap.data()!,
              'Razorpay payment failed'
            );
          }
          if (paySnap.exists) await paySnap.ref.update({ status: 'failed' });
        }
      }
    }

    res.status(200).json({ ok: true });
  }
);

export const registerFcmToken = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { token } = request.data as { token: string };
  if (!token) throw new HttpsError('invalid-argument', 'token required');
  await db
    .collection('users')
    .doc(uid)
    .set(
      { fcmTokens: FieldValue.arrayUnion(token), updatedAt: new Date().toISOString() },
      { merge: true }
    );
  return { ok: true };
});

export const onReviewCreated = onDocumentCreated(
  { document: 'reviews/{reviewId}', region: REGION },
  async (event) => {
    const data = event.data?.data();
    if (!data?.productId) return;
    const productId = data.productId as string;
    const snap = await db.collection('reviews').where('productId', '==', productId).get();
    let sum = 0;
    snap.forEach((d) => {
      sum += Number(d.data().rating) || 0;
    });
    const count = snap.size;
    const rating = count ? Math.round((sum / count) * 10) / 10 : 0;
    await db.collection('products').doc(productId).set({ rating, reviewCount: count }, { merge: true });
  }
);

/** Availability check for a product/window (read-only helper). */
export const checkAvailability = onCall({ region: REGION }, async (request) => {
  const { productId, hubId: requestedHubId, startAt, endAt, quantity = 1 } = request.data as {
    productId: string;
    hubId?: string;
    startAt: string;
    endAt: string;
    quantity?: number;
  };
  if (!productId || !startAt || !endAt) {
    throw new HttpsError('invalid-argument', 'productId, startAt, endAt required');
  }
  const hubId = await resolveHubId(requestedHubId, request.auth?.uid);
  const startMs = new Date(startAt).getTime();
  const endMs = new Date(endAt).getTime();
  const now = Date.now();
  try {
    const units = await pickUnitsForProduct(productId, hubId, quantity, startMs, endMs, now);
    return { ok: true, hubId, availableUnitIds: units };
  } catch {
    return { ok: false, hubId, availableUnitIds: [] as string[] };
  }
});

type PlacesSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
};

type ParsedPlaceAddress = {
  placeId: string;
  formattedAddress: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  pincode: string;
  state?: string;
  lat?: number;
  lng?: number;
};

function componentLong(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }> | undefined,
  type: string
): string {
  const hit = components?.find((c) => c.types?.includes(type));
  return hit?.longText || hit?.shortText || '';
}

function parsePlaceDetails(place: Record<string, unknown>): ParsedPlaceAddress {
  const components = (place.addressComponents || []) as Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  const streetNumber = componentLong(components, 'street_number');
  const route = componentLong(components, 'route');
  const premise = componentLong(components, 'premise');
  const subpremise = componentLong(components, 'subpremise');
  const neighborhood =
    componentLong(components, 'sublocality_level_1') ||
    componentLong(components, 'sublocality') ||
    componentLong(components, 'neighborhood') ||
    componentLong(components, 'sublocality_level_2');
  const city =
    componentLong(components, 'locality') ||
    componentLong(components, 'administrative_area_level_2') ||
    componentLong(components, 'postal_town');
  const pincode = componentLong(components, 'postal_code');
  const state = componentLong(components, 'administrative_area_level_1');

  const lineParts = [subpremise, premise, streetNumber, route].filter(Boolean);
  const line1 = lineParts.join(', ') || (place.formattedAddress as string)?.split(',')[0]?.trim() || '';
  const location = place.location as { latitude?: number; longitude?: number } | undefined;

  return {
    placeId: (place.id as string) || '',
    formattedAddress: (place.formattedAddress as string) || '',
    line1,
    line2: undefined,
    area: neighborhood || city,
    city: city || 'Bengaluru',
    pincode,
    state: state || undefined,
    lat: location?.latitude,
    lng: location?.longitude,
  };
}

/** Google Places Autocomplete (New) — India-biased, auth required. */
export const placesAutocomplete = onCall({ region: REGION }, async (request) => {
    requireAuth(request.auth?.uid);
    const { input, sessionToken, latitude, longitude, radiusMeters } = (request.data || {}) as {
      input?: string;
      sessionToken?: string;
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
    };
    const q = (input || '').trim();
    if (q.length < 2) return { suggestions: [] as PlacesSuggestion[] };

    const key = googleMapsApiKey.value();
    if (!key) throw new HttpsError('failed-precondition', 'Places API key not configured');

    const body: Record<string, unknown> = {
      input: q,
      includedRegionCodes: ['in'],
      languageCode: 'en',
      regionCode: 'IN',
    };
    if (sessionToken) body.sessionToken = sessionToken;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      body.locationBias = {
        circle: {
          center: { latitude, longitude },
          radius: radiusMeters ?? 45000,
        },
      };
    } else {
      // Bengaluru default bias
      body.locationBias = {
        circle: {
          center: { latitude: 12.9716, longitude: 77.5946 },
          radius: 50000,
        },
      };
    }

    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn('placesAutocomplete failed', { status: res.status, text: text.slice(0, 300) });
      throw new HttpsError('internal', 'Places autocomplete unavailable');
    }
    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string;
          place?: string;
          text?: { text?: string };
          structuredFormat?: {
            mainText?: { text?: string };
            secondaryText?: { text?: string };
          };
        };
      }>;
    };

    const suggestions: PlacesSuggestion[] = (data.suggestions || [])
      .map((s) => {
        const p = s.placePrediction;
        if (!p?.placeId) return null;
        return {
          placeId: p.placeId,
          primaryText: p.structuredFormat?.mainText?.text || p.text?.text || '',
          secondaryText: p.structuredFormat?.secondaryText?.text || '',
          fullText: p.text?.text || '',
        };
      })
      .filter((s): s is PlacesSuggestion => Boolean(s));

    return { suggestions };
  });

/** Place Details (New) — resolves structured address fields for forms. */
export const placeDetails = onCall({ region: REGION }, async (request) => {
    requireAuth(request.auth?.uid);
    const { placeId, sessionToken } = (request.data || {}) as {
      placeId?: string;
      sessionToken?: string;
    };
    if (!placeId) throw new HttpsError('invalid-argument', 'placeId required');

    const key = googleMapsApiKey.value();
    if (!key) throw new HttpsError('failed-precondition', 'Places API key not configured');

    const params = new URLSearchParams();
    if (sessionToken) params.set('sessionToken', sessionToken);
    const qs = params.toString() ? `?${params}` : '';
    const id = placeId.replace(/^places\//, '');
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location,displayName',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn('placeDetails failed', { status: res.status, text: text.slice(0, 300) });
      throw new HttpsError('internal', 'Place details unavailable');
    }
    const place = (await res.json()) as Record<string, unknown>;
    return { place: parsePlaceDetails(place) };
  });
