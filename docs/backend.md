# PlayPort backend (Firebase)

Project: **playport-blr-2026**  
Region: **asia-south1**  
Account: playportofficial@gmail.com

## Services

- **Authentication** — Anonymous + Email/Password + Google Sign-In
- **Cloud Firestore** — catalog, inventory, users, orders

## Collections

| Collection | Access |
|---|---|
| `categories`, `products`, `experiences`, `hubs`, `inventory` | Public read, admin write only |
| `users/{uid}` (+ `addresses`, `cart`) | Owner read/write |
| `orders` | Owner create/read/update |

## Local env

Copy `.env` values (already scaffolded) — `EXPO_PUBLIC_FIREBASE_*`.

## Commands

```bash
npm run firebase:seed      # requires temporary open rules
npm run firebase:deploy    # auth + firestore rules
```

App falls back to mock catalog if Firestore is empty or unreachable.
