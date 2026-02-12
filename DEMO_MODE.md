# Demo Mode

The dashboard is currently running in **DEMO MODE** with authentication disabled.

## Quick Start

```bash
cd dashboard
npm run dev
```

Visit `http://localhost:3001` and you'll have full access to all pages without login.

## How It Works

Demo mode is controlled by a single flag in `src/middleware.ts`:

```typescript
const DEMO_MODE = true;  // Set to false to re-enable authentication
```

When `DEMO_MODE = true`:
- All authentication checks are bypassed
- You can access any page directly
- No login required
- No API token needed

## Re-enabling Authentication

To restore full authentication:

1. Open `dashboard/src/middleware.ts`
2. Change `DEMO_MODE` from `true` to `false`:
   ```typescript
   const DEMO_MODE = false;
   ```
3. Set up the backend admin authentication system
4. Configure the login endpoint in the auth API

That's it! One line change to toggle between demo and production mode.

## Current State

- ✅ Demo mode enabled
- ✅ All pages accessible
- ✅ No backend required for UI demo
- ⚠️ API calls will fail (expected in demo mode)
- ⚠️ No real data (use mock data for demo)

## Pages Available

- `/` - Redirects to dashboard
- `/users` - User management
- `/analytics` - Analytics dashboard
- `/clothing` - Clothing items
- `/collections` - Collections management
- `/subscriptions` - Subscription management
- `/cms` - CMS content
- `/audit-logs` - Audit logs
- `/system` - System status
