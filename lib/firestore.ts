import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Category,
  Experience,
  HubInfo,
  Order,
  Product,
  User,
} from '@/types';

function mapDocs<T extends { id: string }>(snap: Awaited<ReturnType<typeof getDocs>>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
}

export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  return mapDocs<Category>(snap);
}

export async function fetchProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  return mapDocs<Product>(snap);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function fetchExperiences(): Promise<Experience[]> {
  const snap = await getDocs(collection(db, 'experiences'));
  return mapDocs<Experience>(snap);
}

export async function fetchExperience(id: string): Promise<Experience | null> {
  const snap = await getDoc(doc(db, 'experiences', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Experience;
}

export async function fetchHub(id = 'indiranagar'): Promise<HubInfo | null> {
  const snap = await getDoc(doc(db, 'hubs', id));
  if (!snap.exists()) return null;
  return snap.data() as HubInfo;
}

export async function fetchInventoryForHub(hubId = 'indiranagar') {
  const snap = await getDocs(query(collection(db, 'inventory'), where('hubId', '==', hubId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function upsertUserProfile(userId: string, data: Partial<User> & DocumentData) {
  await setDoc(
    doc(db, 'users', userId),
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  );
  return mapDocs<Order>(snap);
}

export async function createOrder(orderId: string, data: Order & { userId: string }) {
  await setDoc(doc(db, 'orders', orderId), {
    ...data,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });
}
