/**
 * Catalog seed for playport-fd57f via Firestore REST + Firebase CLI token.
 *
 * SAFETY: This script will NOT write products unless the catalog is empty AND you
 * pass --confirm-seed. It will NEVER restore over an existing/non-empty catalog
 * (even with --force). Use Admin → Products to manage live SKUs.
 *
 * Usage (empty project only):
 *   npx tsx scripts/seedRest.ts --confirm-seed
 */
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { CATEGORIES, EXPERIENCES, HUB, PRODUCTS } from '../data/mock';

const PROJECT = process.env.GCLOUD_PROJECT || 'playport-fd57f';
const parent = `projects/${PROJECT}/databases/(default)/documents`;

function token(): string {
  const cfg = JSON.parse(
    readFileSync(join(homedir(), '.config/configstore/firebase-tools.json'), 'utf8')
  );
  if (!cfg.tokens?.access_token) throw new Error('No Firebase CLI access token');
  return cfg.tokens.access_token as string;
}

function toFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v === null) fields[k] = { nullValue: null };
    else if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') {
      fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map((item) => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') {
              return Number.isInteger(item)
                ? { integerValue: String(item) }
                : { doubleValue: item };
            }
            if (typeof item === 'object' && item) {
              return { mapValue: { fields: toFields(item as Record<string, unknown>) } };
            }
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: toFields(v as Record<string, unknown>) } };
    }
  }
  return fields;
}

async function upsert(collection: string, id: string, data: Record<string, unknown>) {
  const url = `https://firestore.googleapis.com/v1/${parent}/${collection}/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) {
    throw new Error(`${collection}/${id} ${res.status} ${(await res.text()).slice(0, 400)}`);
  }
}

async function productCount(tok: string): Promise<number> {
  const listUrl = `https://firestore.googleapis.com/v1/${parent}/products?pageSize=1`;
  const res = await fetch(listUrl, { headers: { Authorization: `Bearer ${tok}` } });
  const body = (await res.json()) as { documents?: unknown[] };
  return body.documents?.length ?? 0;
}

async function main() {
  const confirmed =
    process.argv.includes('--confirm-seed') || process.env.CONFIRM_SEED === '1';
  const tok = token();
  const existing = await productCount(tok);

  if (existing > 0) {
    console.error(
      'Refusing to seed: products already exist in Firestore.\n' +
        'Admin deletes stay deleted. Manage the catalog in Admin → Products.\n' +
        'This script never overwrites or restores a non-empty catalog.'
    );
    process.exit(1);
  }

  if (!confirmed) {
    console.error(
      'Catalog is empty, but seed still requires an explicit confirm.\n' +
        'Run: npx tsx scripts/seedRest.ts --confirm-seed\n' +
        'Only do this for a brand-new empty environment — never to “refresh” live SKUs.'
    );
    process.exit(1);
  }

  const now = new Date().toISOString();
  const hub = { ...HUB, active: true };
  await upsert('hubs', hub.id, hub as unknown as Record<string, unknown>);
  console.log('hub', hub.id);

  for (const c of CATEGORIES) {
    await upsert('categories', c.id, c as unknown as Record<string, unknown>);
  }
  console.log('categories', CATEGORIES.length);

  for (const p of PRODUCTS) {
    await upsert('products', p.id, p as unknown as Record<string, unknown>);
  }
  console.log('products', PRODUCTS.length);

  const combos = EXPERIENCES;
  if (combos.length) {
    for (const e of combos) {
      await upsert('experiences', e.id, e as unknown as Record<string, unknown>);
    }
    console.log('experiences', combos.length);
  } else {
    console.log('experiences skipped (empty)');
  }

  let units = 0;
  for (const p of PRODUCTS) {
    for (let i = 1; i <= 3; i++) {
      const n = String(i).padStart(3, '0');
      const id = `${p.id}-${n}`;
      await upsert('inventory_units', id, {
        id,
        productId: p.id,
        hubId: hub.id,
        skuLabel: `${p.shortName.toUpperCase().replace(/\s+/g, '-')}-${n}`,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      });
      units++;
    }
  }
  console.log('inventory_units', units);
  console.log('Seed complete for', PROJECT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
