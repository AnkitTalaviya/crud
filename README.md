# StockPilot

StockPilot is an inventory operations app built with React, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore. It covers inventory records, purchase-order tracking, supplier management, audit history, low-stock alerts, CSV import/export, and role-aware access controls.

## Project Overview

StockPilot helps individual operators and small teams manage stock with:

- secure sign up, login, logout, and persistent sessions
- a protected dashboard with summary cards, attention queues, reorder suggestions, and recent stock movement activity
- full CRUD for inventory items with purchase-order context
- search, filtering, sorting, and detail views
- ordered, expected receipt, and received date tracking
- purchase-order workflow with PO numbers, quantity on order, and ordered / partial / received / cancelled states
- supplier management with contacts, lead times, and linked inventory records
- stock movement logging for receive, issue, and adjust actions
- audit history for create, edit, delete, import, and stock transactions
- low-stock, overdue-delivery, and upcoming-receipt notifications
- CSV import and export plus JSON export
- role-aware admin / manager / viewer access
- light and dark themes with persisted preference
- responsive layouts for mobile, tablet, and desktop
- motion and background rendering with Framer Motion and React Three Fiber

## Chosen Stack And Why

### Frontend

- React 19 + Vite
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- Three.js via React Three Fiber and Drei
- Lucide React

### Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting config included

### Why Firebase Over Supabase Here

Firebase was chosen because it supports a client-side inventory app with authentication and document storage without a separate API layer:

1. Firebase Auth and Firestore are very fast to wire into a Vite frontend without managing SQL schemas, migrations, or a separate API layer.
2. Firestore includes an always-free quota for small apps, including 1 GiB storage, 50k reads/day, 20k writes/day, and 20k deletes/day according to the official quotas page.
3. Firebase Authentication's Spark plan supports email/password auth for small deployments.
4. Supabase is also a strong option, but this project was optimized around Firebase's frontend-first integration model.

Official references used for this decision:

- Firestore quotas: https://firebase.google.com/docs/firestore/quotas
- Firebase Authentication limits: https://firebase.google.com/docs/auth/limits
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase pricing: https://supabase.com/pricing

## Folder Structure

```text
src/
  components/
    auth/
    common/
    dashboard/
    inventory/
  context/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  services/
  utils/
```

## Features

- Landing page and authentication flow
- Login and signup flows with validation and loading states
- Protected app routes
- Inventory dashboard analytics
- Inventory create, edit, delete, and detail flows
- Purchase order workflow with PO numbers, quantity on order, and order statuses
- Receive, issue, and adjust stock transaction flows
- Supplier directory with lead times and contacts
- Audit history for inventory activity
- In-app operational notifications
- Delivery calendar for ordered, expected, and received inventory milestones
- CSV and JSON export plus CSV import
- Delete confirmation modal
- Toast feedback
- Empty, loading, and error states
- Role-aware admin, manager, and viewer access
- Theme toggle with `localStorage` persistence and system fallback
- Background scene effects for auth and app screens

## Data Model

Each inventory item includes:

- `id`
- `name`
- `sku`
- `description`
- `category`
- `quantity`
- `unitPrice`
- `reorderLevel`
- `location`
- `supplierId`
- `supplier`
- `purchaseOrderNumber`
- `quantityOnOrder`
- `orderStatus`
- `tags`
- `status`
- `orderedOn`
- `expectedOn`
- `receivedOn`
- `createdAt`
- `updatedAt`
- `userId`

`status` is calculated from `quantity` and `reorderLevel`:

- `in_stock`
- `low_stock`
- `out_of_stock`

Additional collections:

- `suppliers`
- `inventoryTransactions`
- `userProfiles`

## How Auth And Database Work

- Firebase Authentication handles email/password signup, login, logout, and session persistence.
- Firestore stores inventory items in the `inventoryItems` collection.
- Suppliers are stored in `suppliers`.
- Audit history is stored in `inventoryTransactions`.
- Role and reminder preferences are stored in `userProfiles`.
- Every document is written with the authenticated user's `uid` as `userId`.
- The UI only queries records for the current user.
- Firestore security rules in [firestore.rules](./firestore.rules) enforce user-specific access at the database level.

## How Theme And Background Scenes Work

- Theme state is managed in `ThemeContext`.
- The preference is saved in `localStorage` under `stockpilot-theme`.
- The app falls back to `prefers-color-scheme` when the user selects `system`.
- The `AuthScene` component uses React Three Fiber and Drei to render a lightweight background scene for the authentication flow.
- The authenticated app uses a background scene behind the main application shell.
- Reduced motion users receive a static fallback instead of animation.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to Firebase Console.
2. Create a new project.
3. Add a Web app to the project.
4. Copy the Firebase config into a local `.env` file based on `.env.example`.
5. In Authentication, enable the `Email/Password` provider.
6. In Firestore Database, create a database.

### 3. Add environment variables

Create `.env` from `.env.example`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Start the app

```bash
npm run dev
```

### 5. Apply Firestore rules

Install the Firebase CLI if you do not already have it:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## Troubleshooting

### `Firebase: auth/configuration-not-found`

If login or signup shows `Firebase: auth/configuration-not-found`, the most common cause is Firebase Authentication not being enabled for the project.

Check these items in order:

1. Firebase Console -> Authentication -> click `Get started` if Authentication has not been initialized yet.
2. Firebase Console -> Authentication -> Sign-in method -> enable `Email/Password`.
3. Firebase Console -> Project settings -> Your apps -> confirm the web app config matches your local `.env`.
4. Restart the Vite dev server after any `.env` change.
5. If you are testing on a deployed domain, add that domain under Authentication -> Settings -> Authorized domains.

## Sample Data Seeding

The app is intended to create records through the UI. A quick starter set you can add manually:

1. `Field Service Kit`, SKU `KIT-204`, category `Field gear`, quantity `18`, reorder level `8`
2. `Packaging Tape 48mm`, SKU `PKG-019`, category `Packing`, quantity `6`, reorder level `10`
3. `Barcode Scanner Dock`, SKU `SCAN-112`, category `Hardware`, quantity `0`, reorder level `3`

## Build For Production

```bash
npm run build
```

The production build is created in `dist/`.

## Deployment Options

### Option 1: Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

Before deploying hosting, connect your Firebase project:

```bash
firebase login
firebase use --add
```

### Option 2: Vercel Or Netlify

1. Push the project to GitHub.
2. Import it into Vercel or Netlify.
3. Add the same `VITE_FIREBASE_*` environment variables in the deployment dashboard.
4. Use:
   - Build command: `npm run build`
   - Output directory: `dist`

## Production Notes

- Firebase config is kept in environment variables.
- No secrets are hardcoded.
- Database access is protected at both the UI and Firestore rules layers.
- Search, filtering, and sorting are handled client-side after user-scoped fetches to keep setup simple and avoid composite index friction for first-time deploys.
