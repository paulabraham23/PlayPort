/**
 * Admin SDK seed — catalog, generic hub, physical inventory units.
 *
 * Hub is data, not business logic. Override with SEED_HUB_ID / SEED_HUB_CITY etc.
 *
 * Usage: npm run firebase:seed:admin -- --confirm-seed
 * Never restores a non-empty catalog. */
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  CATEGORIES,
  EXPERIENCES,
  HUB,
  PRODUCTS,
} from '../data/mock';

const UNITS_PER_PRODUCT = Number(process.env.SEED_UNITS_PER_PRODUCT || 3);

function initAdmin() {
  if (getApps().length) return getApps()[0]!;

  const saPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    resolve(process.cwd(), 'serviceAccount.json');

  if (existsSync(saPath) && saPath.endsWith('.json')) {
    const json = JSON.parse(readFileSync(saPath, 'utf8'));
    return initializeApp({
      credential: cert(json),
      projectId: json.project_id || 'playport-fd57f',
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || 'playport-fd57f',
  });
}

async function main() {
  const confirmed =
    process.argv.includes('--confirm-seed') || process.env.CONFIRM_SEED === '1';
  initAdmin();
  const db = getFirestore();
  const now = new Date().toISOString();

  const existing = await db.collection('products').limit(1).get();
  if (!existing.empty) {
    console.error(
      'Refusing to seed: products already exist in Firestore.\n' +
        'Admin deletes stay deleted. Manage SKUs in Admin → Products.\n' +
        'This script never restores a non-empty catalog ( --force is ignored ).'
    );
    process.exit(1);
  }

  if (!confirmed) {
    console.error(
      'Catalog is empty, but seed requires an explicit confirm.\n' +
        'Run: npm run firebase:seed:admin -- --confirm-seed'
    );
    process.exit(1);
  }

  const hub = {
    id: process.env.SEED_HUB_ID || HUB.id,
    name: process.env.SEED_HUB_NAME || HUB.name,
    city: process.env.SEED_HUB_CITY || HUB.city,
    state: process.env.SEED_HUB_STATE || HUB.state,
    active: true,
    sector: HUB.sector,
    etaMinutes: HUB.etaMinutes,
    statusLabel: HUB.statusLabel,
  };

  for (const category of CATEGORIES) {
    await db.collection('categories').doc(category.id).set(category);
  }
  for (const product of PRODUCTS) {
    await db.collection('products').doc(product.id).set(product);
  }
  for (const experience of EXPERIENCES) {
    await db.collection('experiences').doc(experience.id).set(experience);
  }

  await db.collection('hubs').doc(hub.id).set(hub);

  for (const product of PRODUCTS) {
    for (let i = 1; i <= UNITS_PER_PRODUCT; i++) {
      const n = String(i).padStart(3, '0');
      const unitId = `${product.id}-${n}`;
      await db.collection('inventory_units').doc(unitId).set({
        id: unitId,
        productId: product.id,
        hubId: hub.id,
        skuLabel: `${product.shortName.toUpperCase().replace(/\s+/g, '-')}-${n}`,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  console.log(
    `Seeded hub ${hub.id} (${hub.city}), ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${PRODUCTS.length * UNITS_PER_PRODUCT} inventory units`
  );
}

main().catch((err) => {
  console.error(err);
  console.error(
    '\nTip: place a service account JSON at ./serviceAccount.json or set GOOGLE_APPLICATION_CREDENTIALS.'
  );
  process.exit(1);
});
