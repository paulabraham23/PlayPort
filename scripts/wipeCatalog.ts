/**
 * Intentionally wipe the live product catalog (+ inventory units).
 * Does NOT touch hubs, categories, orders, or users.
 *
 * Usage: npx tsx scripts/wipeCatalog.ts --confirm-wipe
 */
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const PROJECT = process.env.GCLOUD_PROJECT || 'playport-fd57f';
const parent = `projects/${PROJECT}/databases/(default)/documents`;

function token(): string {
  const cfg = JSON.parse(
    readFileSync(join(homedir(), '.config/configstore/firebase-tools.json'), 'utf8')
  );
  if (!cfg.tokens?.access_token) throw new Error('No Firebase CLI access token');
  return cfg.tokens.access_token as string;
}

async function listAll(collection: string): Promise<string[]> {
  const names: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/${parent}/${collection}`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
    if (!res.ok) throw new Error(`list ${collection} ${res.status}`);
    const body = (await res.json()) as { documents?: { name: string }[]; nextPageToken?: string };
    for (const d of body.documents ?? []) names.push(d.name);
    pageToken = body.nextPageToken;
  } while (pageToken);
  return names;
}

async function deleteName(name: string) {
  const res = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`delete ${name} ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

async function main() {
  if (!process.argv.includes('--confirm-wipe') && process.env.CONFIRM_WIPE !== '1') {
    console.error('Refusing wipe. Pass --confirm-wipe to delete all products + inventory_units.');
    process.exit(1);
  }
  const products = await listAll('products');
  const units = await listAll('inventory_units');
  console.log(`Deleting ${products.length} products and ${units.length} units…`);
  for (const n of [...units, ...products]) {
    await deleteName(n);
    console.log('deleted', n.split('/').pop());
  }
  console.log('Catalog wipe complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
