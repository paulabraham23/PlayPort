import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function submitFeedback(input: { text: string; channel: 'text' | 'voice' }) {
  const user = auth.currentUser;
  await addDoc(collection(db, 'feedback'), {
    text: input.text.trim().slice(0, 1800),
    channel: input.channel,
    userId: user?.uid ?? null,
    createdAt: serverTimestamp(),
  });
}
