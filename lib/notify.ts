import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/types';

export async function createUserNotification(
  userId: string,
  payload: {
    title: string;
    body: string;
    type: AppNotification['type'];
    orderId?: string;
  }
): Promise<void> {
  if (!userId) return;
  const ref = doc(collection(db, 'users', userId, 'notifications'));
  const createdAt = new Date().toISOString();
  await setDoc(ref, {
    id: ref.id,
    title: payload.title,
    body: payload.body,
    type: payload.type,
    orderId: payload.orderId ?? null,
    read: false,
    createdAt,
    timeLabel: 'Just now',
  });
}
