# PlayPort backend (Firebase)

Project: **playport-blr-2026**  
Region: **asia-south1**  
Account: playportofficial@gmail.com

Firestore is the **source of truth**. Zustand caches UI state only — never authoritative for inventory, orders, payments, or reservations.

## Eight systems

| System | Storage | Client writes? |
|--------|---------|----------------|
| Auth & Users | Auth + `users/{uid}` | Profile fields |
| Catalog | `categories`, `products`, `experiences`, `hubs` | No |
| Inventory | `inventory_units` + `inventory_reservations` | No |
| Bookings/Orders | `orders/{orderId}` | Read own only |
| Payments | `payments/{id}` + Razorpay | No |
| Addresses | `users/{uid}/addresses` | Owner |
| Reviews | `reviews/{id}` | Owner create |
| Notifications | `users/{uid}/notifications` + FCM | Read/update; Functions create |

## Inventory (V1 SoT)

```
products → inventory_units → inventory_reservations
```

- **Unit:** physical asset (`ps5-001`) at a `hubId`
- **Reservation:** `{ inventoryUnitId, startAt, endAt, status: hold|confirmed|released|completed, holdExpiresAt }`
- Overlapping `{hold,confirmed}` windows on the same unit are rejected
- Expired holds (`holdExpiresAt <= now`) released by `releaseExpiredInventoryHold` (callable + every 5 min)

Aggregate counters are **not** used for booking.

## Hubs

Generic docs: `id, name, city, state, active, …`  
No city hardcoding in Functions. Booking resolves hub via request → `users.homeHubId` → first active hub.  
Seed data may create a launch hub (see `SEED_HUB_*` env / mock `HUB`).

## Cloud Functions

| Function | Role |
|----------|------|
| `createBooking` | Pick free units for window; create `hold` reservations + order (`paymentStatus: pending`, 15m hold) |
| `confirmPayment` | Paid → reservations `confirmed`; clear hold |
| `cancelBooking` | Release reservations; cancel order |
| `updateOrderStatus` | State machine transitions (ops/admin; limited customer) |
| `completeReturn` | Reservations `completed`; order completed |
| `releaseExpiredInventoryHold` | Release abandoned payment holds |
| `releaseExpiredInventoryHoldSchedule` | Cron every 5 minutes |
| `checkAvailability` | Read-only unit pick for a window |
| `createRazorpayOrder` / `razorpayWebhook` | Payments (Phase 2) |
| `registerFcmToken` / `onReviewCreated` | Push + rating aggregates |

### Order fulfillment vs payment

Fulfillment: `confirmed → preparing → out_for_delivery → delivered → active → returning → completed` (+ `cancelled` / `refunded`)  
Payment (separate): `pending | paid | failed | refunded`

## Pre-Blaze (Spark) — what works now

Most of the app does **not** need Blaze. Only **deploying Cloud Functions to production** does.

| Works on Spark now | Needs Blaze (or local emulators) |
|--------------------|----------------------------------|
| Firestore rules + indexes deploy | `firebase:deploy:functions` |
| Admin seed (catalog, hub, `inventory_units`) | Production checkout (`createBooking`) |
| Guest browse + catalog from Firestore | Real Phone Auth SMS |
| Mock OTP login (any 6 digits) | Scheduled hold expiry cron |
| Cart + addresses sync to Firestore | Razorpay webhook (HTTP Function) |
| User profile in `users/{uid}` | FCM push from Functions |

**Until Blaze:** checkout shows a clear message that the server is not live yet. Everything else works.

### Local checkout without Blaze (emulators)

```bash
# Terminal 1
npm run firebase:emulators

# Terminal 2 — add to .env.local
EXPO_PUBLIC_USE_EMULATORS=1

npm run web
```

Emulators run Functions locally at no cost. Seed emulators with `firebase:seed:admin` pointed at emulator, or import after seed.

### When Blaze is ready (day 1–2)

```bash
firebase login   # playportofficial@gmail.com
npm run firebase:seed:admin
npm run firebase:deploy:all
```

Then remove `EXPO_PUBLIC_USE_EMULATORS` for production builds.

## Commands

```bash
npm run firebase:seed:admin          # units + hub (Admin SDK)
npm run firebase:deploy:firestore      # rules + indexes only (Spark OK)
npm run firebase:deploy:functions      # requires Blaze
npm run firebase:emulators             # local Functions (no Blaze)
```
