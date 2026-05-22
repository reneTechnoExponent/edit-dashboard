# Admin Setup

Reference for the EDIT admin platform — backend API in `EDIT/` and admin dashboard in `edit-dashboard/`. For broader project context see `SETUP_GUIDE.md` and the steering files under `.kiro/steering/`.

## Architecture

| App               | Stack                                    | Dev Port |
|-------------------|------------------------------------------|----------|
| `EDIT/`           | Node.js v20.19.5 + Express 5.1.0         | 3000     |
| `edit-dashboard/` | Next.js 16.1.6 + TS strict + React 19.2 | 3001     |

The dashboard expects the backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`). Auth is JWT via `Authorization: Bearer <token>`, issued only by `config/generateToken.js`.

## Seeding

Two scripts are wired into `EDIT/package.json`:

```bash
cd EDIT
npm run seed           # Idempotent — creates admins only if none exist, then seeds templates, taxonomy, CMS, event keywords, analytics
npm run reset-admins   # Deletes all admins and recreates the two defaults below
```

`npm run seed` runs in this order: admins → email templates → taxonomy → CMS → event keywords → analytics (`seeds/index.js`).

Use `reset-admins` when you've forgotten a password or need a known-good state. It only touches the `Admin` collection.

## Default Admin Credentials

| Role          | Email                        | Password     |
|---------------|------------------------------|--------------|
| `super_admin` | `admin@editwithforma.com`    | `Admin@123`  |
| `admin`       | `support@editwithforma.com`  | `Support@123`|

Passwords are hashed by the `pre('save')` hook on `models/admin.model.js` (bcrypt, salt rounds = 10). Change them in production.

## Quick Start

```bash
# Terminal 1 — backend
cd EDIT
npm install
npm run reset-admins
npm start                      # http://localhost:3000

# Terminal 2 — dashboard
cd edit-dashboard
npm install
npm run dev                    # http://localhost:3001
```

Visit `http://localhost:3001`, then sign in with the super admin credentials above.

## Backend Files (Admin Surface)

```
EDIT/
├── models/admin.model.js
├── controllers/
│   ├── admin.auth.controller.js
│   ├── admin.users.controller.js
│   ├── admin.analytics.controller.js
│   ├── admin.email.analytics.controller.js
│   ├── admin.clothing.controller.js
│   ├── admin.subscription.controller.js
│   ├── admin.cms.controller.js
│   └── admin.notification.controller.js
├── middleware/admin.auth.middleware.js
├── routes/
│   ├── admin.routes.js                  # mounted at /api/admin
│   ├── admin.auth.routes.js
│   ├── admin.users.routes.js
│   ├── admin.analytics.routes.js
│   ├── admin.email.analytics.routes.js
│   ├── admin.clothing.routes.js
│   ├── admin.subscription.routes.js
│   ├── admin.cms.routes.js
│   └── admin.notification.routes.js
└── seeds/
    ├── admin.seed.js
    ├── reset-admins.js
    └── index.js
```

## API Endpoints

All admin routes mount under `/api/admin` (see `routes/admin.routes.js`). Every route except login passes through `adminAuthGuard`.

### Authentication
- `POST /api/admin/auth/login`
- `GET  /api/admin/auth/profile`

### Users
- `GET    /api/admin/users` — paginated list with search and filters
- `GET    /api/admin/users/stats`
- `GET    /api/admin/users/:id`
- `PATCH  /api/admin/users/:id/status` — `{ status: "active" | "inactive" }`
- `DELETE /api/admin/users/:id` — soft delete
- `DELETE /api/admin/users/:id/purge` — hard delete + cascade across owned data

### Analytics
- `GET /api/admin/analytics/metrics` — real DB-backed metrics
- `GET /api/admin/analytics/...` — email analytics endpoints from `admin.email.analytics.controller.js`

### Clothing, Subscriptions, CMS, Notifications
- `GET /api/admin/clothing-items`
- `GET /api/admin/subscriptions`
- `GET /api/admin/cms`
- `GET /api/admin/notifications`

Each is backed by its respective controller — not mock data.

### Placeholder Routes (still inline in `admin.routes.js`)
- `GET /api/admin/collections`
- `GET /api/admin/audit-logs`
- `GET /api/admin/system/cron-jobs`

These return empty payloads. Replace with real controllers when implementing those surfaces — keep the `{ success, message, data }` response shape and follow the `validators → auth → controller` middleware order.

## Frontend Configuration

`edit-dashboard/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

The dashboard runs on port 3001 (set in `package.json` via `next dev -p 3001`). RTK Query base lives in `src/lib/api.ts`; new endpoints inject into `adminApi` from `src/features/{domain}/{domain}Api.ts` with cache tags declared.

Existing feature slices: `analytics`, `audit`, `auth`, `clothing`, `cms`, `collections`, `subscriptions`, `system`, `users`.

## Adding a New Admin Feature

1. `EDIT/controllers/admin.{feature}.controller.js` — named exports, `async/await`, throw on error.
2. `EDIT/middleware/{feature}.validator.js` if mutating — `express-validator`.
3. `EDIT/routes/admin.{feature}.routes.js` — order is **validators → `adminAuthGuard` → controller**.
4. Mount in `EDIT/routes/admin.routes.js`: `router.use("/{feature}", require("./admin.{feature}.routes"))`.
5. Inject the dashboard endpoint via `adminApi.injectEndpoints()` and declare cache tags from the existing union (`Users`, `ClothingItems`, `Collections`, `Subscriptions`, `CronJobs`, `AuditLogs`, `Analytics`, `CMS`).

Multi-document writes require a Mongoose transaction — abort in `catch`, end the session in `finally`.

## Troubleshooting

**Login fails after seeding**
```bash
cd EDIT && npm run reset-admins
```

**Port already in use**
- Backend: set `PORT=` in `EDIT/.env`.
- Dashboard: change `next dev -p 3001` in `edit-dashboard/package.json` and update `NEXT_PUBLIC_API_URL` accordingly.

**CORS errors**
Confirm the backend is reachable at the URL in `NEXT_PUBLIC_API_URL`. Adjust `corsOptions` in `EDIT/server.js` only if needed.

**Database connection**
The seeders read `MONGO_URI` from `EDIT/.env` and connect with `dbName: "edit"`. If the URI is missing or the network is blocked, both seeding and the API will fail at startup.

**Token issues**
Verify `JWT_SECRET` is set in `EDIT/.env`. Tokens are 7-day, generated only via `config/generateToken.js`.
