# Developer Handoff

This document covers everything a new developer needs to get oriented, make changes, and deploy safely.

---

## Codebase Orientation

```
src/app/         → All pages and API routes (Next.js App Router)
src/lib/         → Shared server-side utilities
src/components/  → Shared UI components
prisma/          → Schema, seed scripts
public/          → Static assets served at /
messages/        → i18n JSON files
maytees-coming-soon/ → Separate static coming-soon site (not part of this Next.js build)
assets/          → Source photos (not served, for reference)
```

### src/app/

The entire application lives here. Next.js App Router conventions:
- `page.tsx` → renders the route
- `layout.tsx` → wraps child pages (used for auth guards and nav)
- `route.ts` → API endpoint
- `[param]/` → dynamic route segment

Route groups (no URL segment): `src/app/api/{plants,bookings,...}` — these are symlinked convenience folders, not actual Next.js route groups.

### src/lib/

| File | Purpose |
|---|---|
| `prisma.ts` | Prisma client singleton. Always import from here — never instantiate `new PrismaClient()` directly in route files. |
| `auth.ts` | NextAuth configuration. Import `authOptions` from here whenever you call `getServerSession()`. |
| `email.ts` | All 16 email functions using Resend. Graceful no-op if `RESEND_API_KEY` is unset. |
| `microsoft-graph.ts` | Outlook calendar functions: `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent`, `getCalendarEvents`. Graceful no-op if Microsoft env vars unset. |
| `square.ts` | `createSquarePayment()` and `refundSquarePayment()`. Uses `SQUARE_ENVIRONMENT` env var to pick sandbox vs production. |
| `shippo.ts` | `getRates()` and `purchaseLabel()`. Returns empty array if API key not set. |
| `reminders.ts` | `checkAndSendReminders()` — called by the cron endpoint. Finds confirmed bookings 24–25h out and sends reminder emails. |
| `cart-context.tsx` | React Context + Provider for the shopping cart. Uses `localStorage`. Clears automatically on logout via `useSession` hook. |
| `i18n.tsx` | Internationalization helper for EN/ES translations. |
| `utils.ts` | Shared utility functions (classnames, etc.). |

### src/components/

| File | Purpose |
|---|---|
| `layout/Navbar.tsx` | Top navigation bar — logo, page links, cart icon, auth buttons |
| `layout/Footer.tsx` | Footer with business info and links |
| `layout/MainLayout.tsx` | Wrapper that applies Navbar + Footer to public pages |
| `chat/AIChatWidget.tsx` | Floating AI chat bubble — client component, calls `/api/chat` |

---

## Local Setup (Quick Reference)

Requirements: Node 18+, Docker Desktop

```bash
git clone https://github.com/mjordanf/maytees-garden.git
cd maytees-garden
npm install
cp .env.example .env
# Fill in .env — minimum: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

docker run -d --name maytees-postgres \
  -e POSTGRES_USER=maytee -e POSTGRES_PASSWORD=maytee -e POSTGRES_DB=maytees \
  -p 5432:5432 --restart unless-stopped postgres:15
# DATABASE_URL = postgresql://maytee:maytee@localhost:5432/maytees

npx prisma db push
npm run db:seed
npm run db:seed-plants
npm run dev
```

---

## Deployments

Every push to `main` on GitHub triggers a Vercel auto-deploy. Vercel runs:

```bash
prisma generate && next build
```

`prisma generate` regenerates the Prisma Client from `schema.prisma`. It does NOT migrate the database schema — schema changes must be applied separately (see below).

---

## Schema Changes

1. Edit `prisma/schema.prisma`.

2. **Local (Docker Postgres):**
   ```bash
   npx prisma db push
   ```

3. **Production (Neon):**
   ```bash
   DATABASE_URL="[neon-connection-string]" npx prisma db push --accept-data-loss
   ```
   The `--accept-data-loss` flag is required when removing columns or changing types.

4. Redeploy to Vercel (or it will auto-deploy on next push). The deploy runs `prisma generate` which picks up the new schema.

**Critical rule: NEVER use `prisma migrate dev` locally.** The shadow database used by `migrate dev` does not work with this project's configuration. Always use `prisma db push` for both local and production changes.

**Note:** There is no formal migration history. `prisma db push` applies schema diffs directly without creating migration files. If you want to establish migration history going forward, run `prisma migrate dev --create-only` to generate a migration from the current schema, then commit it — but test carefully in a throw-away DB first.

**Seed scripts** are plain `.js` files (`prisma/seed-availability.js`) or TypeScript files run with `ts-node`. They use `require('@prisma/client')` (CommonJS). Do not try to run them as `.ts` directly with `node` — use `ts-node` with `--compiler-options '{"module":"CommonJS"}'` as shown in package.json scripts.

---

## Adding a New Page

1. Create `src/app/[your-route]/page.tsx`.
2. If the page queries the database or cannot be statically cached, add at the top:
   ```typescript
   export const dynamic = 'force-dynamic'
   ```
3. For auth-protected pages, follow the portal pattern in `src/app/portal/layout.tsx`:
   ```typescript
   const session = await getServerSession(authOptions)
   if (!session) redirect('/auth/login?callbackUrl=/your-route')
   ```
4. Wrap public pages in `<MainLayout>` from `src/components/layout/MainLayout.tsx` to get Navbar + Footer.

---

## Adding a New API Route

1. Create `src/app/api/[your-route]/route.ts`.
2. Export named functions: `export async function GET(req: NextRequest)`, `POST`, `PATCH`, `DELETE` as needed.
3. Always check session for protected endpoints:
   ```typescript
   import { getServerSession } from 'next-auth'
   import { authOptions } from '@/lib/auth'

   const session = await getServerSession(authOptions)
   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   ```
4. For admin-only endpoints, also check role:
   ```typescript
   const role = (session.user as any)?.role
   if (role !== 'admin' && role !== 'superadmin') {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
   }
   ```
5. Always return `NextResponse.json()`.
6. Add `export const dynamic = 'force-dynamic'` if the route reads from the DB or must not be cached.

---

## Adding a New Email Template

Add a new exported async function to `src/lib/email.ts`. Follow the existing pattern:

```typescript
export async function sendYourEmail(opts: { /* typed params */ }) {
  const body = `
    <p>Hi <strong>${opts.name}</strong>,</p>
    <p>Your email content here...</p>
  `
  await sendEmail(
    opts.recipientEmail,
    'Your email subject',
    layout('Your Email Title', body),
  )
}
```

- Use the `layout(title, body)` helper — it applies the branded HTML wrapper (green header, Maytee's Garden branding, footer with phone/hours).
- The `sendEmail(to, subject, html)` helper handles the Resend API call. It silently logs to console if `RESEND_API_KEY` is not set — no need to add null checks.
- `FROM` address is set from `RESEND_FROM_EMAIL` env var, falling back to `noreply@mayteesgardencenter.com`.

---

## Adding a New Admin Section

1. Add a nav item to `src/app/admin/layout.tsx` in the `navItems` array:
   ```typescript
   { href: '/admin/your-section', icon: YourIcon, label: 'Your Section', badge: null }
   ```
2. Create the page at `src/app/admin/your-section/page.tsx`.
3. For complex client-side interactivity, split into a server component (page.tsx fetches initial data) and a client component (AdminYourSectionClient.tsx handles state and actions). See `AdminPlantsClient.tsx` for a reference.
4. Add API routes at `src/app/api/admin/your-section/route.ts`.

---

## Gotchas and Known Issues

### `export const dynamic = 'force-dynamic'`

Required on any server component or API route that queries the database. Without it, Vercel may cache the page as static during build, and DB queries will not run on user requests. When in doubt, add it.

### `NEXT_PUBLIC_` prefix for client-side env vars

Any environment variable used in browser-side code (React components, client-side scripts) must be prefixed with `NEXT_PUBLIC_`. These are baked into the JavaScript bundle at build time. Changing them requires a redeploy. The Square Web Payments SDK vars use this prefix: `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`.

### Square environment selection

Do not use `NODE_ENV` to decide between sandbox and production Square credentials. On Vercel, `NODE_ENV` is always `"production"` even on preview deployments. Instead, use the explicit `SQUARE_ENVIRONMENT` env var:

```typescript
// In square.ts — correct pattern:
function getSquareEnv() {
  return process.env.SQUARE_ENVIRONMENT ?? (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')
}
```

Set `SQUARE_ENVIRONMENT=sandbox` in Vercel for preview deployments to use sandbox creds.

### Prisma singleton import

Always import Prisma from `@/lib/prisma`:

```typescript
import { prisma } from '@/lib/prisma'
```

Never do `const prisma = new PrismaClient()` in a route file. In development, Next.js hot reload creates new module instances on each change, which would leak DB connections. The singleton pattern in `prisma.ts` prevents this.

### Cart is localStorage-only

The cart (`CartProvider` in `src/lib/cart-context.tsx`) lives entirely in `localStorage`. There is no server-side cart persistence. The cart clears automatically when the user logs out (detected via `useSession` status change). Guests have a cart but it is tied to the browser tab/session.

### `isomorphic-fetch` not needed

Node.js 18+ has native `fetch`. Do not add `isomorphic-fetch` or `node-fetch` as a dependency.

### Wikimedia image `unoptimized` prop

Plant images sourced from Wikipedia/Wikimedia Commons require the `unoptimized` prop on `next/image`:

```tsx
<Image src={plant.imageUrl} alt={plant.nameEn} unoptimized ... />
```

Without it, Next.js routes all image requests through its image optimization proxy, which can trigger 429 rate limiting from Wikimedia's CDN under load.

### One-off DB scripts

Scripts that need to run against the database (data migrations, one-time fixes) must be:
- Written as `.js` files (not `.ts`) if you want to run them with `node` directly, OR
- Run via `ts-node` with `--compiler-options '{"module":"CommonJS"}'`

The reason is Prisma's module resolution. The seed scripts in `prisma/` use CommonJS `require('@prisma/client')` and work correctly.

### Newsletter send is synchronous

`POST /api/admin/newsletter/send` iterates all confirmed subscribers and calls `sendNewsletter()` for each one sequentially. For small lists (< 100) this is fine. For larger lists, this will timeout (Vercel's 60s limit on Hobby plan) and should be replaced with a background job or batched Resend broadcast.

---

## Service Account Access

| Service | Access |
|---|---|
| Vercel | Owner account (linked to GitHub: mjordanf) |
| GitHub | https://github.com/mjordanf — repo: maytees-garden |
| Neon | Account that created the project at console.neon.tech |
| Square | developer.squareup.com — Maytees Garden Center application |
| Shippo | goshippo.com account linked to business email |
| Resend | resend.com account (verify domain: mayteesgardencenter.com) |
| Anthropic | console.anthropic.com account |
| Azure AD | portal.azure.com — App: "Maytees Garden Calendar" (Maytees Garden tenant) |
| GoDaddy | Domain registrar and Microsoft 365 admin for mayteesgardencenter.com |

---

## Monitoring

| Where | What to look at |
|---|---|
| Vercel → Deployments → Functions tab | Server-side logs, API route errors, cron execution logs |
| Neon console → Monitoring | Query performance, connection count, slow queries |
| Square Developer Dashboard → Logs | Payment creation/refund logs, API errors |
| Resend Dashboard → Logs | Email delivery status, bounces, blocks |
| Azure portal → App registrations → Monitoring | Microsoft Graph API calls, token issuance failures |

---

## Known Tech Debt and Recommended Next Steps

### Etsy Sync (Phase 2)

Schema fields already exist: `Plant.etsyListingId`, `Plant.etsyLastSync`, `StoreOrder.etsyOrderId`. The Etsy API integration (OAuth, listing sync, order pull) is not built. This is the most significant planned feature for Phase 2.

### Update `NEXTAUTH_URL` when domain is live

When `mayteesgardencenter.com` DNS is updated to point at the main Vercel app (not just the coming-soon page), update `NEXTAUTH_URL` in Vercel environment variables to `https://mayteesgardencenter.com` and trigger a redeploy. Email links in all transactional emails use this value.

### Establish proper migration history

Currently, all schema changes use `prisma db push` which applies diffs without creating migration files. This means there is no schema change history. Consider running `npx prisma migrate diff` and creating an initial baseline migration to establish history going forward.

### Plant image CDN caching

Wikimedia image URLs are fetched directly in the browser. For high-traffic production use, these should be cached via a CDN or Vercel Image Optimization with appropriate remote patterns configured in `next.config.mjs`.

### Newsletter performance

The admin "Send Newsletter" feature sends emails synchronously in a single API call. For lists over ~100 subscribers, this will hit Vercel's function timeout. Migrate to a Resend broadcast or a background queue (e.g., Vercel Cron + DB job queue) before the list grows.

### Superadmin settings page

`/superadmin/settings` is read-only. The intent is to make site configuration (business name, address, hours) editable from the UI and stored in a `SiteConfig` DB table. This is a straightforward addition: add the Prisma model, the API route, and wire up the form.

### Individual newsletter subscriber management

The admin UI shows total subscriber count but does not allow removing a specific subscriber. Add a subscriber list view to `/admin/leads` with a remove/unsubscribe action per row.
