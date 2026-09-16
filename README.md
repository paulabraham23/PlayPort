# PlayPort

Quick commerce for entertainment — React Native (Expo) customer app built once for **Web now**, with **iOS** and **Android** later from the same codebase.

## Stack

- Expo SDK 57 + Expo Router
- React Native / React Native Web
- TypeScript
- Zustand (auth, cart, addresses, orders, payments)
- Mock data in `data/mock.ts` (swap for APIs later)

## Run

```bash
npm install
npm run web      # http://localhost:8081
npm start      # Expo dev tools (web / iOS / Android)
```

## Primary journey

Login / Guest → Home → Search / Explore → Product or Experience → Duration → Cart → Address → Checkout → Payment → Confirmation → Orders → Order detail → Tracking (Coming Soon) → Return / Review

## Structure

```
app/           Expo Router screens
components/    Shared UI (layout, products, cart, orders, …)
constants/     Theme tokens
data/          Mock catalog & seed state
store/         Zustand app store
types/         Domain models
hooks/         Responsive helpers
utils/         Formatters & search
```

## Design

Dark quick-commerce UI with PlayPort Orange (`#E85D04`). Typography: Inter only.
