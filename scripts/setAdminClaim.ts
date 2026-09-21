/**
 * Grant or revoke Firebase Auth custom claim `admin: true`.
 *
 * Usage:
 *   npm run firebase:admin:claim -- <uid>
 *   npm run firebase:admin:claim -- <uid> --revoke
 *
 * After granting, the user must sign out/in (or refreshIdToken) so the claim
 * appears on their ID token.
 */
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

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
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const revoke = args.includes('--revoke');
  const uid = args.find((a) => !a.startsWith('--'));

  if (!uid) {
    console.error('Usage: npm run firebase:admin:claim -- <uid> [--revoke]');
    process.exit(1);
  }

  initAdmin();
  const auth = getAuth();
  const user = await auth.getUser(uid);
  const nextClaims = { ...(user.customClaims ?? {}) };

  if (revoke) {
    delete nextClaims.admin;
  } else {
    nextClaims.admin = true;
  }

  await auth.setCustomUserClaims(uid, nextClaims);
  console.log(
    revoke
      ? `Revoked admin claim for ${uid} (${user.phoneNumber ?? user.email ?? 'no contact'})`
      : `Granted admin claim for ${uid} (${user.phoneNumber ?? user.email ?? 'no contact'})`
  );
  console.log('User must sign out and sign in again for the claim to take effect.');
}

main().catch((err) => {
  console.error(err);
  console.error(
    '\nTip: place a service account JSON at ./serviceAccount.json or set GOOGLE_APPLICATION_CREDENTIALS.'
  );
  process.exit(1);
});
