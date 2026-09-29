import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { callCompleteReturn, callUpdateOrderStatus } from '@/lib/functions';
import type {
  AppConfig,
  Category,
  Experience,
  HubInfo,
  InventoryUnit,
  InventoryUnitStatus,
  Order,
  OrderStatus,
  Product,
  Review,
  User,
} from '@/types';
import { DEFAULT_APP_CONFIG } from '@/types';

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

const PROGRESS: Record<string, number> = {
  preparing: 35,
  out_for_delivery: 55,
  delivered: 70,
  active: 85,
  returning: 92,
  completed: 100,
  cancelled: 0,
  refunded: 0,
};

function mapDocs<T extends { id: string }>(snap: Awaited<ReturnType<typeof getDocs>>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
}

function stripUndefined(data: DocumentData): DocumentData {
  const cleaned: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned;
}

function isFunctionsUnavailable(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? '';
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code.includes('not-found') ||
    code.includes('unavailable') ||
    code.includes('failed-precondition') ||
    /NOT_FOUND|INTERNAL|UNAVAILABLE|CORS|network/i.test(msg)
  );
}

// ——— Products ———

export async function adminListProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  return mapDocs<Product>(snap).sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function adminUpsertProduct(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', product.id), stripUndefined(product as unknown as DocumentData), {
    merge: true,
  });
}

export async function adminDeleteProduct(id: string): Promise<void> {
  // Cascade inventory units for this SKU so orphan stock cannot linger.
  const units = await getDocs(query(collection(db, 'inventory_units'), where('productId', '==', id)));
  await Promise.all(units.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'products', id));
  // Verify — surface permission/rules failures instead of a silent UI-only remove.
  const stillThere = await getDoc(doc(db, 'products', id));
  if (stillThere.exists()) {
    throw new Error(
      `Delete did not stick for “${id}”. Check you are signed in as ops/admin and refresh.`
    );
  }
}

// ——— Hubs ———

export async function adminListHubs(): Promise<HubInfo[]> {
  const snap = await getDocs(collection(db, 'hubs'));
  return mapDocs<HubInfo>(snap).sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminUpsertHub(hub: HubInfo): Promise<void> {
  await setDoc(doc(db, 'hubs', hub.id), stripUndefined(hub as unknown as DocumentData), {
    merge: true,
  });
}

export async function adminDeleteHub(id: string): Promise<void> {
  await deleteDoc(doc(db, 'hubs', id));
}

// ——— Inventory units ———

export async function adminListInventoryUnits(): Promise<InventoryUnit[]> {
  const snap = await getDocs(collection(db, 'inventory_units'));
  return mapDocs<InventoryUnit>(snap).sort((a, b) => a.skuLabel.localeCompare(b.skuLabel));
}

export async function adminUpsertInventoryUnit(unit: InventoryUnit): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(
    doc(db, 'inventory_units', unit.id),
    stripUndefined({
      ...unit,
      updatedAt: now,
      createdAt: unit.createdAt || now,
    } as unknown as DocumentData),
    { merge: true }
  );
}

export async function adminSetUnitStatus(id: string, status: InventoryUnitStatus): Promise<void> {
  await updateDoc(doc(db, 'inventory_units', id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function adminDeleteInventoryUnit(id: string): Promise<void> {
  await deleteDoc(doc(db, 'inventory_units', id));
}

// ——— Orders / deliveries ———

export async function adminListOrders(status?: OrderStatus): Promise<Order[]> {
  if (status) {
    const snap = await getDocs(query(collection(db, 'orders'), where('status', '==', status)));
    return mapDocs<Order>(snap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return mapDocs<Order>(snap);
  } catch {
    const snap = await getDocs(collection(db, 'orders'));
    return mapDocs<Order>(snap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function adminGetOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export function adminNextStatuses(from: OrderStatus): OrderStatus[] {
  return (ORDER_TRANSITIONS[from] ?? []) as OrderStatus[];
}

async function releaseReservationsLocal(
  reservationIds: string[],
  status: 'released' | 'completed'
): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all(
    reservationIds.map((rid) =>
      updateDoc(doc(db, 'inventory_reservations', rid), {
        status,
        holdExpiresAt: null,
        updatedAt: now,
      }).catch(() => undefined)
    )
  );
}

async function updateOrderStatusLocal(orderId: string, status: OrderStatus): Promise<void> {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Order not found');
  const order = snap.data() as Order;
  const allowed = ORDER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new Error(`Cannot transition ${order.status} → ${status}`);
  }

  const now = new Date().toISOString();
  await updateDoc(ref, {
    status,
    progressPercent: PROGRESS[status] ?? order.progressPercent,
    updatedAt: now,
    ...(status === 'completed' ? { completedAt: now } : {}),
  });

  const reservationIds = order.reservationIds ?? [];
  if (status === 'completed') {
    await releaseReservationsLocal(reservationIds, 'completed');
  } else if (status === 'cancelled' || status === 'refunded') {
    await releaseReservationsLocal(reservationIds, 'released');
  }
}

export async function adminAdvanceOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ via: 'functions' | 'firestore' }> {
  if (status === 'completed') {
    try {
      await callCompleteReturn(orderId);
      return { via: 'functions' };
    } catch (err) {
      if (!isFunctionsUnavailable(err)) {
        // Fall through for permission / transition issues when Functions exist but claim missing
        try {
          await updateOrderStatusLocal(orderId, status);
          return { via: 'firestore' };
        } catch {
          throw err;
        }
      }
      await updateOrderStatusLocal(orderId, status);
      return { via: 'firestore' };
    }
  }

  try {
    await callUpdateOrderStatus(orderId, status);
    return { via: 'functions' };
  } catch (err) {
    if (!isFunctionsUnavailable(err)) {
      try {
        await updateOrderStatusLocal(orderId, status);
        return { via: 'firestore' };
      } catch {
        throw err;
      }
    }
    await updateOrderStatusLocal(orderId, status);
    return { via: 'firestore' };
  }
}

export async function adminDashboardCounts(): Promise<{
  products: number;
  availableUnits: number;
  totalUnits: number;
  openOrders: number;
  hubs: number;
  experiences: number;
  categories: number;
  reviews: number;
}> {
  const [products, units, orders, hubs, experiences, categories, reviews] = await Promise.all([
    adminListProducts(),
    adminListInventoryUnits(),
    adminListOrders(),
    adminListHubs(),
    adminListExperiences(),
    adminListCategories(),
    adminListReviews(),
  ]);
  const open = orders.filter((o) =>
    ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'active', 'returning'].includes(
      o.status
    )
  );
  return {
    products: products.length,
    availableUnits: units.filter((u) => u.status === 'available').length,
    totalUnits: units.length,
    openOrders: open.length,
    hubs: hubs.length,
    experiences: experiences.length,
    categories: categories.length,
    reviews: reviews.length,
  };
}

// ——— Categories ———

export async function adminListCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  return mapDocs<Category>(snap).sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminUpsertCategory(category: Category): Promise<void> {
  await setDoc(
    doc(db, 'categories', category.id),
    stripUndefined(category as unknown as DocumentData),
    { merge: true }
  );
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ——— Experiences / Combos ———

export async function adminListExperiences(): Promise<Experience[]> {
  const snap = await getDocs(collection(db, 'experiences'));
  return mapDocs<Experience>(snap).sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminGetExperience(id: string): Promise<Experience | null> {
  const snap = await getDoc(doc(db, 'experiences', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Experience;
}

export async function adminUpsertExperience(experience: Experience): Promise<void> {
  await setDoc(
    doc(db, 'experiences', experience.id),
    stripUndefined(experience as unknown as DocumentData),
    { merge: true }
  );
}

export async function adminDeleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, 'experiences', id));
}

// ——— Reviews ———

export async function adminListReviews(): Promise<Review[]> {
  try {
    const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
    return mapDocs<Review>(snap);
  } catch {
    const snap = await getDocs(collection(db, 'reviews'));
    return mapDocs<Review>(snap);
  }
}

export async function adminDeleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', id));
}

// ——— Customers ———

export async function adminListUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return mapDocs<User>(snap).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

// ——— Feedback ———

export type AdminFeedback = {
  id: string;
  text: string;
  channel: 'text' | 'voice';
  userId: string | null;
  createdAtMs: number;
};

export async function adminListFeedback(): Promise<AdminFeedback[]> {
  const snap = await getDocs(collection(db, 'feedback'));
  return snap.docs
    .map((d) => {
      const data = d.data() as {
        text?: string;
        channel?: string;
        userId?: string | null;
        createdAt?: { seconds?: number };
      };
      const seconds = data.createdAt?.seconds;
      return {
        id: d.id,
        text: data.text ?? '',
        channel: data.channel === 'voice' ? ('voice' as const) : ('text' as const),
        userId: data.userId ?? null,
        createdAtMs: seconds ? seconds * 1000 : 0,
      };
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

// ——— App config ———

export async function adminGetAppConfig(): Promise<AppConfig> {
  const snap = await getDoc(doc(db, 'config', 'app'));
  if (!snap.exists()) return { ...DEFAULT_APP_CONFIG };
  return { ...DEFAULT_APP_CONFIG, ...(snap.data() as AppConfig) };
}

export async function adminSaveAppConfig(config: AppConfig): Promise<void> {
  await setDoc(
    doc(db, 'config', 'app'),
    stripUndefined({
      ...config,
      updatedAt: new Date().toISOString(),
    } as unknown as DocumentData),
    { merge: true }
  );
}
