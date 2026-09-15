import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getFirestore, setDoc, writeBatch } from 'firebase/firestore';
import {
  CATEGORIES,
  EXPERIENCES,
  HUB,
  PRODUCTS,
} from '../data/mock';

const firebaseConfig = {
  apiKey: 'AIzaSyA2jGQ74H_FFUfYp-9B1iZyx9Q86M2VaGI',
  authDomain: 'playport-blr-2026.firebaseapp.com',
  projectId: 'playport-blr-2026',
  storageBucket: 'playport-blr-2026.firebasestorage.app',
  messagingSenderId: '149399541034',
  appId: '1:149399541034:web:95a442d98b07419a83fa53',
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInAnonymously(auth);
  console.log('Signed in anonymously for seed');

  // Temporary seed rules must allow writes — deploy open rules before running,
  // or use Admin SDK. This script expects seed-open rules OR admin bypass.

  let batch = writeBatch(db);
  let ops = 0;
  const commitMaybe = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  for (const category of CATEGORIES) {
    batch.set(doc(db, 'categories', category.id), category);
    ops += 1;
    await commitMaybe();
  }

  for (const product of PRODUCTS) {
    batch.set(doc(db, 'products', product.id), product);
    ops += 1;
    await commitMaybe();
  }

  for (const experience of EXPERIENCES) {
    batch.set(doc(db, 'experiences', experience.id), experience);
    ops += 1;
    await commitMaybe();
  }

  batch.set(doc(db, 'hubs', 'indiranagar'), {
    ...HUB,
    id: 'indiranagar',
    city: 'Bengaluru',
    active: true,
  });
  ops += 1;

  for (const product of PRODUCTS) {
    const available = Math.max(2, Math.floor(Math.random() * 12) + 2);
    batch.set(doc(db, 'inventory', `indiranagar_${product.id}`), {
      hubId: 'indiranagar',
      productId: product.id,
      available,
      reserved: 0,
      out: 0,
      sanitizing: 0,
      updatedAt: new Date().toISOString(),
    });
    ops += 1;
    await commitMaybe();
  }

  if (ops > 0) await batch.commit();
  console.log('Seed complete: categories, products, experiences, hub, inventory');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
