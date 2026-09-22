/**
 * @deprecated Disabled — do not use.
 * Live catalog is owned by Admin → Products / Firestore.
 * Empty-env seed only: `npx tsx scripts/seedRest.ts --confirm-seed`
 */
async function main() {
  console.error(
    'seedFirestore.ts is disabled.\n' +
      'Use Admin → Products for live SKUs, or scripts/seedRest.ts --confirm-seed on an empty env only.'
  );
  process.exit(1);
}

main();
