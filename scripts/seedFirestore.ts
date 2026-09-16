import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getFirestore, writeBatch } from 'firebase/firestore';
import {
  CATEGORIES,
  EXPERIENCES,
  HUB,
  PRODUCTS,
} from '../data/mock';

/**
 * @deprecated Prefer `npm run firebase:seed:admin` (Admin SDK + inventory_units).
 * This client seed cannot write under production rules.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyA2jGQ74H_FFUfYp-9B1iZyx9Q86M2VaGI',
  authDomain: 'playport-blr-2026.firebaseapp.com',
  projectId: 'playport-blr-2026',
  storageBucket: 'playport-blr-2026.firebasestorage.app',
  messagingSenderId: '149399541034',
  appId: '1:149399541034:web:95a442d98b07419a83fa53',
};

async function main() {
  console.warn('Use firebase:seed:admin for inventory_units. This script is legacy.');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  await signInAnonymously(auth);

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

  batch.set(doc(db, 'hubs', HUB.id), HUB);
  ops += 1;

  const now = new Date().toISOString();
  for (const product of PRODUCTS) {
    for (let i = 1; i <= 3; i++) {
      const n = String(i).padStart(3, '0');
      const unitId = `${product.id}-${n}`;
      batch.set(doc(db, 'inventory_units', unitId), {
        id: unitId,
        productId: product.id,
        hubId: HUB.id,
        skuLabel: `${product.shortName}-${n}`,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      });
      ops += 1;
      await commitMaybe();
    }
  }

  if (ops > 0) await batch.commit();
  console.log('Legacy seed attempted (may fail under locked rules)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
