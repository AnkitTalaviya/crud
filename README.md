# StockPilot 📦

Welcome to **StockPilot** - a modern inventory operations app for small teams.

It helps you track stock, purchase orders, suppliers, alerts, and team access in one place.

## Why It Feels Useful ✨

- Simple sign up and login
- Clean dashboard with live inventory insights
- Track purchase orders and receiving dates
- Supplier directory with lead times
- Activity history (audit log)
- Notification center for low stock and overdue receipts
- Team roles: admin, manager, viewer
- CSV import/export + JSON export
- Light and dark mode

## What You Can Do 🧩

### Inventory
- Create, update, delete items
- Receive, issue, and adjust stock
- Track on-hand vs on-order quantity
- Track PO status: none, ordered, partial, received, cancelled

### Suppliers
- Add supplier contacts and lead times
- Link suppliers to inventory items

### Operations
- See alerts for low stock and delayed deliveries
- Use calendar for ordered/expected/received dates
- Keep complete transaction history

### Team & Access
- Invite users to a workspace
- Approve/reject access requests
- Manage roles and account status

## Tech Stack 🛠️

### Frontend
- React 19 + Vite
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- React Three Fiber + Drei

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting (optional deploy path)

## Quick Start 🚀

### 1. Install

```bash
npm install
```

### 2. Configure Firebase

In Firebase Console:
1. Create project
2. Add web app
3. Enable Email/Password auth
4. Create Firestore database

### 3. Add environment variables

Create `.env` (based on `.env.example`):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run app

```bash
npm run dev
```

### 5. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## Login Info 🔐

### Default ID / Password
- Default testing admin account:
	- Email: `test@test.com`
	- Password: `test@test`
- You can still create your own account from the Signup screen.

### Placeholders in UI
- Email placeholder: `test@test.com`
- Password placeholder: `test@test`

## What To Expect On First Use 👀

When you sign up:
- If you choose **admin** and keep workspace blank, the app bootstraps a new workspace for you.
- If you choose an existing workspace/role, your request may require approval.

Inside app:
- Empty workspace shows starter panel
- You can load demo data from UI for quick exploration
- Dashboard and notifications become more useful as data grows

## Useful Commands 📋

```bash
npm run dev      # start local dev server
npm run lint     # lint code
npm run test     # run unit tests
npm run build    # production build
npm run preview  # preview production build
```

## Deployment 🌐

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

### Vercel / Netlify
- Connect repo
- Add all `VITE_FIREBASE_*` variables
- Build command: `npm run build`
- Output dir: `dist`

## Security Notes 🛡️

- Firestore rules enforce workspace-level access
- Auth and profile states are role-aware
- Environment variables are used for Firebase config
- Avoid committing private credentials in `.env`

## Upgrade Ideas 🔮

If you want to improve this project further:

- Add E2E tests (Playwright/Cypress)
- Add dashboard charts for trends and forecast
- Add barcode scanning support
- Add multi-language support
- Add background jobs/Cloud Functions for reminders
- Add soft-delete + restore workflows
- Add stronger CI pipeline (lint + test + build + preview)
- Migrate to latest major versions in controlled steps (Vite, Firebase, Tailwind, Zod)

## Troubleshooting Quick Tips 🧯

### Auth errors
- Verify Email/Password provider is enabled
- Check `.env` values
- Restart dev server after env changes

### Firestore permission errors
- Confirm rules are deployed
- Confirm user is in correct workspace and role

### Firestore not enabled / DB missing
- Enable Firestore API
- Create default Firestore database

---

Built with care for practical inventory operations ❤️
