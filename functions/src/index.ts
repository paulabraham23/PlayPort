import { createHmac, randomBytes } from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type DocumentData, type DocumentReference } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret, defineString } from 'firebase-functions/params';

initializeApp();
const db = getFirestore();

const REGION = 'asia-south1';
/** Payment hold TTL before inventory is released automatically. */
const HOLD_TTL_MS = 15 * 60 * 1000;

const ORDER_TRANSITIONS: Record<string, string[]> = {
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
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');

type CartItem = {
  id: string;
  productId?: string;
  experienceId?: string;
  name: string;
  image: string;
  durationId: string;
  durationLabel: string;
  unitPrice: number;
  quantity: number;
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

function durationHours(durationId: string): number {
  switch (durationId) {
    case '6h':
      return 6;
    case '12h':
      return 12;
    case '24h':
      return 24;
    case 'weekend':
      return 48;
    default:
      return 12;
  }
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
  now: number
): Promise<string[]> {
  const unitsSnap = await db
    .collection('inventory_units')
    .where('productId', '==', productId)
    .where('hubId', '==', hubId)
    .where('status', '==', 'available')
    .get();

  const picked: string[] = [];
  for (const doc of unitsSnap.docs) {
    if (picked.length >= quantity) break;
    const busy = await unitHasOverlap(doc.id, startMs, endMs, now);
    if (!busy) picked.push(doc.id);
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
    paymentMethodLabel: string;
    subtotal: number;
    taxes: number;
    total: number;
    startAt?: string;
  };

  if (!Array.isArray(cart) || !cart.length) {
    throw new HttpsError('invalid-argument', 'Cart is empty');
  }

  const hubId = await resolveHubId(requestedHubId, uid);
  const now = Date.now();
  const startAt = startAtInput ? new Date(startAtInput) : new Date(now + 60 * 60 * 1000);
  if (Number.isNaN(startAt.getTime())) {
    throw new HttpsError('invalid-argument', 'Invalid startAt');
  }

  const maxHours = Math.max(...cart.map((c) => durationHours(c.durationId)));
  const endAt = new Date(startAt.getTime() + maxHours * 60 * 60 * 1000);
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();
  const holdExpiresAt = new Date(now + HOLD_TTL_MS).toISOString();
  const startIso = startAt.toISOString();
  const endIso = endAt.toISOString();
  const nowIso = new Date().toISOString();

  const productLines = cart.filter((c) => c.productId);
  const unitAssignments: { productId: string; unitId: string }[] = [];

  for (const line of productLines) {
    const unitIds = await pickUnitsForProduct(
      line.productId!,
      hubId,
      line.quantity,
      startMs,
      endMs,
      now
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
    status: 'confirmed' as const,
    paymentStatus: 'pending' as const,
    createdAt: nowIso,
    updatedAt: nowIso,
    holdExpiresAt,
    startAt: startIso,
    endAt: endIso,
    reservationIds,
    etaLabel: '7:45 PM',
    addressLabel,
    addressFull,
    items: cart.map((c) => ({
      productId: c.productId ?? null,
      experienceId: c.experienceId ?? null,
      name: c.name,
      image: c.image,
      durationLabel: c.durationLabel,
      returnLabel: `Returns ${endAt.toLocaleString('en-IN')}`,
      price: c.unitPrice * c.quantity,
      badges: c.includesNote ? [c.includesNote.slice(0, 28)] : [],
    })),
    subtotal,
    taxes,
    total,
    paymentMethodLabel,
    progressPercent: 10,
    setupIncluded: true,
    liveDispatch: false,
  };

  batch.set(db.collection('orders').doc(id), order);
  await batch.commit();

  const cartSnap = await db.collection('users').doc(uid).collection('cart').get();
  await Promise.all(cartSnap.docs.map((d) => d.ref.delete()));

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
  });

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
  if (order.userId !== uid && request.auth?.token?.admin !== true) {
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

// ——— Razorpay ———

export const createRazorpayOrder = onCall(
  { region: REGION, secrets: [razorpayKeySecret] },
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
  await pushNotification(order.userId, {
    title: 'Payment received',
    body: `${orderId} is confirmed and being packed.`,
    type: 'payment',
    orderId,
  });
  void providerRef;
}

export const razorpayWebhook = onRequest(
  { region: REGION, secrets: [razorpayKeySecret, razorpayWebhookSecret] },
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
