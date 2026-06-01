# Maytee's Garden Center

Full-stack website for **Maytee's Garden Center**, a boutique nursery and landscape design business in Miami, FL. The site combines an e-commerce plant shop with a booking system for landscape consultations, a customer portal, and a full admin panel.

---

## Live URLs

| URL | Description |
|---|---|
| https://maytees-garden.vercel.app | Main application (production) |
| https://mayteesgardencenter.com | Coming soon page (separate Vercel project: `maytees-coming-soon`) |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.15 | Framework (App Router) |
| React | 18.3.1 | UI library |
| TypeScript | 5.6.3 | Type safety |
| Tailwind CSS | 3.4.14 | Styling |
| Prisma | 5.18.0 | ORM |
| PostgreSQL | 15 (Neon) | Database |
| NextAuth.js | 4.24.7 | Authentication (JWT strategy) |
| Square | 44.1.0 | Payment processing |
| Shippo | 2.18.0 | Shipping rates and labels |
| Resend | 6.12.4 | Transactional email |
| @anthropic-ai/sdk | 0.27.0 | AI chat widget (Claude) |
| @microsoft/microsoft-graph-client | 3.0.7 | Outlook calendar sync |
| bcryptjs | 2.4.3 | Password hashing |
| date-fns | 4.1.0 | Date utilities |
| react-hook-form | 7.53.1 | Form handling |
| zod | 3.23.8 | Schema validation |
| lucide-react | 0.462.0 | Icons |
| Radix UI | various | Accessible UI primitives |

---

## Directory Structure

```
maytees-garden/
├── prisma/
│   ├── schema.prisma          # Database schema (14 models)
│   ├── seed.ts                # Seeds users, services, testimonials, gallery
│   ├── seed-plants.ts         # Seeds plant catalog
│   ├── seed-availability.js   # Seeds availability templates
│   └── migrations/            # Migration history
├── public/
│   ├── gallery/               # Landscaping project photos
│   ├── images/                # General site images
│   ├── logo.jpg               # Brand logo
│   ├── Maytee1.jpeg           # Owner photo variants
│   ├── Maytee2.jpeg
│   └── Maytee3.jpeg
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Navbar, Footer, providers)
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── services/          # Services listing
│   │   ├── plants/            # Plant catalog
│   │   ├── gallery/           # Project gallery
│   │   ├── contact/           # Contact form
│   │   ├── booking/           # Consultation booking wizard
│   │   ├── shop/
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── checkout/      # Checkout (address → shipping → payment)
│   │   │   └── order/[id]/    # Order confirmation page
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── newsletter/
│   │   │   ├── confirm/       # Email confirmation landing
│   │   │   ├── confirmed/     # Success page
│   │   │   └── unsubscribed/  # Unsubscribe landing
│   │   ├── portal/            # Customer portal (auth required)
│   │   │   ├── layout.tsx     # Portal sidebar nav
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── favorites/     # Saved plants
│   │   │   ├── appointments/  # Booking history
│   │   │   ├── orders/        # Order history
│   │   │   ├── messages/      # Message Maytee
│   │   │   └── settings/      # Account settings
│   │   ├── admin/             # Admin panel (admin/staff/superadmin)
│   │   │   ├── layout.tsx     # Admin sidebar nav
│   │   │   ├── page.tsx       # Dashboard with stats
│   │   │   ├── inbox/         # Message inbox with tabs
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── availability/  # Schedule configuration
│   │   │   ├── orders/        # Store order management
│   │   │   ├── plants/        # Plant catalog management
│   │   │   ├── users/         # Customer list
│   │   │   ├── leads/         # Contact forms + newsletter
│   │   │   ├── logs/          # Audit logs
│   │   │   └── test-email/    # Email pipeline test (hidden from nav)
│   │   ├── superadmin/        # Super admin panel (superadmin only)
│   │   │   ├── layout.tsx     # Dark theme sidebar
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── users/         # Full user management
│   │   │   └── settings/      # Website settings (read-only)
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth + register + password reset
│   │       ├── plants/        # Plant CRUD
│   │       ├── services/      # Services listing
│   │       ├── bookings/      # Create booking
│   │       ├── appointments/[id]/ics/  # ICS calendar download
│   │       ├── availability/  # Slots, templates, overrides
│   │       ├── favorites/     # Save/unsave plants
│   │       ├── contact/       # Contact form submission
│   │       ├── inbox/         # Customer → admin message
│   │       ├── newsletter/    # Subscribe/confirm/unsubscribe
│   │       ├── chat/          # AI chat (Anthropic)
│   │       ├── upload/        # Image upload
│   │       ├── store/         # Checkout, shipping rates, orders
│   │       ├── cron/reminders # Appointment reminder cron
│   │       └── admin/         # Admin-specific endpoints
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── email.ts           # All email functions (Resend)
│   │   ├── microsoft-graph.ts # Outlook calendar sync
│   │   ├── square.ts          # Square payment helper
│   │   ├── shippo.ts          # Shippo shipping helper
│   │   ├── reminders.ts       # Cron reminder logic
│   │   ├── cart-context.tsx   # React cart context (localStorage)
│   │   ├── i18n.tsx           # Internationalization (EN/ES)
│   │   └── utils.ts           # Shared utilities
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   └── MainLayout.tsx
│       └── chat/
│           └── AIChatWidget.tsx
├── messages/
│   ├── en.json                # English translations
│   └── es.json                # Spanish translations
├── maytees-coming-soon/       # Separate static coming soon project
├── assets/                    # Source photos (WhatsApp originals)
├── vercel.json                # Cron job configuration
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Environment Variables

| Variable | Description | Where to get | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Neon dashboard → Connection string | Both |
| `NEXTAUTH_SECRET` | JWT signing secret (32+ chars) | `openssl rand -base64 32` | Both |
| `NEXTAUTH_URL` | Full base URL of the app | `http://localhost:3001` local; `https://maytees-garden.vercel.app` prod | Both |
| `ANTHROPIC_API_KEY` | Claude API key for AI chat | console.anthropic.com | Both |
| `RESEND_API_KEY` | Transactional email API key | resend.com dashboard | Both |
| `RESEND_FROM_EMAIL` | Sender email address | Must be a verified Resend domain | Both |
| `SQUARE_ACCESS_TOKEN` | Square production access token | developer.squareup.com → Production creds | Prod |
| `SQUARE_LOCATION_ID` | Square production location ID | Square Developer Dashboard | Prod |
| `SQUARE_SANDBOX_ACCESS_TOKEN` | Square sandbox access token | developer.squareup.com → Sandbox creds | Local/Dev |
| `SQUARE_SANDBOX_LOCATION_ID` | Square sandbox location ID | Square Developer Dashboard | Local/Dev |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Square App ID for Web Payments SDK (client-side) | Square Developer Dashboard | Both |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Square Location ID for Web Payments SDK (client-side) | Square Developer Dashboard | Both |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` | Set explicitly — do not rely on NODE_ENV | Both |
| `SHIPPO_API_KEY` | Shippo production API key | goshippo.com → API | Both |
| `SHIPPO_TEST_API_KEY` | Shippo test API key (optional) | goshippo.com → Test tokens | Local |
| `BUSINESS_PHONE` | Business phone number | Set to `7862276616` | Both |
| `ADMIN_EMAIL` | Business email for alerts | Set to `info@mayteesgardencenter.com` | Both |
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID | portal.azure.com → App registration Overview | Both |
| `MICROSOFT_CLIENT_ID` | Azure AD application (client) ID | portal.azure.com → App registration Overview | Both |
| `MICROSOFT_CLIENT_SECRET` | Azure AD client secret value | portal.azure.com → Certificates & secrets | Both |
| `MICROSOFT_CALENDAR_USER` | Outlook account for calendar | Set to `info@mayteesgardencenter.com` | Both |
| `CRON_SECRET` | Bearer token for cron endpoint | `openssl rand -hex 32` | Both |

> **Note:** If `RESEND_API_KEY` is not set, all email functions silently log to console instead of sending — safe for local development without email credentials. If Microsoft Graph vars are not set, calendar sync is silently disabled.

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker Desktop (for local PostgreSQL)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/mjordanf/maytees-garden.git
cd maytees-garden

# 2. Install dependencies
npm install

# 3. Copy and fill environment variables
cp .env.example .env
# Edit .env — fill in at minimum: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Start a local PostgreSQL database
docker run -d \
  --name maytees-postgres \
  -e POSTGRES_USER=maytee \
  -e POSTGRES_PASSWORD=maytee \
  -e POSTGRES_DB=maytees \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:15

# Set DATABASE_URL in .env to:
# postgresql://maytee:maytee@localhost:5432/maytees

# 5. Push schema to the database (creates all tables)
npx prisma db push

# 6. Seed base data (users, services, testimonials, gallery items)
npm run db:seed

# 7. Seed the plant catalog
npm run db:seed-plants

# 8. Start the dev server
npm run dev
# → http://localhost:3000
```

### Test Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | maytee@mayteesgarden.com | Admin2024! | Sees Admin Panel link in nav |
| Staff | staff@mayteesgarden.com | Staff2024! | Admin panel access, no superadmin |
| Customer | test@customer.com | Customer2024! | Standard customer portal |
| Super Admin | maytee@mayteesgardencenter.com | Maytee@Admin2026 | /superadmin only |

---

## Database Commands

| Command | Description |
|---|---|
| `npm run db:seed` | Seed users, services, testimonials, gallery |
| `npm run db:seed-plants` | Seed the plant catalog |
| `npm run db:studio` | Open Prisma Studio at localhost:5555 |
| `npm run db:reset` | Reset all migrations and re-seed (destructive) |
| `npx prisma db push` | Push schema changes to local DB (no migration file) |
| `DATABASE_URL="[neon-url]" npx prisma db push --accept-data-loss` | Push schema changes to Neon (production) |

> **Important:** Do not use `npm run db:migrate` locally. The shadow database required by `prisma migrate dev` does not work with the current setup. Always use `prisma db push` for both local and production schema changes.

---

## All Routes

### Public Pages

| URL | Description | Auth | Role |
|---|---|---|---|
| `/` | Home page | No | — |
| `/about` | About Maytee | No | — |
| `/services` | Services listing | No | — |
| `/plants` | Plant catalog with search/filter | No | — |
| `/gallery` | Project gallery | No | — |
| `/contact` | Contact form | No | — |
| `/booking` | Consultation booking wizard | No | — |
| `/shop/cart` | Shopping cart | No | — |
| `/shop/checkout` | Checkout (address → shipping → payment) | No | — |
| `/shop/order/[id]` | Order confirmation | No | — |
| `/newsletter/confirm` | Confirm newsletter subscription | No | — |
| `/newsletter/confirmed` | Subscription confirmed success page | No | — |
| `/newsletter/unsubscribed` | Unsubscribed success page | No | — |

### Auth Pages

| URL | Description | Auth | Role |
|---|---|---|---|
| `/auth/login` | Login page | No | — |
| `/auth/register` | Registration page | No | — |
| `/auth/forgot-password` | Request password reset | No | — |
| `/auth/reset-password` | Reset password with token | No | — |

### Customer Portal

| URL | Description | Auth | Role |
|---|---|---|---|
| `/portal` | Dashboard | Yes | customer+ |
| `/portal/favorites` | Saved plants | Yes | customer+ |
| `/portal/appointments` | Booking history | Yes | customer+ |
| `/portal/orders` | Order history | Yes | customer+ |
| `/portal/messages` | Message Maytee | Yes | customer+ |
| `/portal/settings` | Account settings | Yes | customer+ |

### Admin Panel

| URL | Description | Auth | Role |
|---|---|---|---|
| `/admin` | Dashboard with stats | Yes | admin/staff/superadmin |
| `/admin/inbox` | Message inbox | Yes | admin/staff/superadmin |
| `/admin/bookings` | Booking management | Yes | admin/staff/superadmin |
| `/admin/availability` | Schedule configuration | Yes | admin/staff/superadmin |
| `/admin/orders` | Store order management | Yes | admin/staff/superadmin |
| `/admin/plants` | Plant catalog management | Yes | admin/staff/superadmin |
| `/admin/users` | Customer list | Yes | admin/staff/superadmin |
| `/admin/leads` | Contact forms + newsletter | Yes | admin/staff/superadmin |
| `/admin/logs` | Audit logs | Yes | admin/staff/superadmin |
| `/admin/test-email` | Email pipeline test (hidden from nav) | Yes | admin/staff/superadmin |

### Super Admin

| URL | Description | Auth | Role |
|---|---|---|---|
| `/superadmin` | Dashboard | Yes | superadmin only |
| `/superadmin/users` | Full user management | Yes | superadmin only |
| `/superadmin/settings` | Website settings (read-only) | Yes | superadmin only |

### API Routes

| URL | Method(s) | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/plants` | GET, POST | List plants / create plant (admin) |
| `/api/plants/[id]` | GET, PATCH, DELETE | Single plant CRUD |
| `/api/services` | GET | List active services |
| `/api/bookings` | POST | Create a booking |
| `/api/appointments/[id]/ics` | GET | Download ICS calendar file |
| `/api/availability/slots` | GET | Get available time slots for a date |
| `/api/availability/templates` | GET, POST | Weekly schedule templates |
| `/api/availability/overrides` | GET, POST | Blocked dates / overrides |
| `/api/availability/overrides/[id]` | DELETE | Remove a specific override |
| `/api/favorites` | GET, POST, DELETE | Manage saved plants |
| `/api/contact` | POST | Submit contact form |
| `/api/inbox` | POST | Send message to admin inbox |
| `/api/newsletter/subscribe` | POST | Subscribe to newsletter |
| `/api/newsletter/confirm` | GET | Confirm newsletter subscription |
| `/api/newsletter/unsubscribe` | GET | Unsubscribe from newsletter |
| `/api/chat` | POST | AI chat (Anthropic Claude) |
| `/api/upload` | POST | Upload image file |
| `/api/store/checkout` | POST | Process plant purchase |
| `/api/store/shipping-rates` | POST | Get Shippo shipping rates |
| `/api/store/orders` | GET | List orders (admin) |
| `/api/store/orders/[id]` | GET, PATCH | Single order view/update |
| `/api/store/orders/[id]/label` | POST | Generate Shippo shipping label |
| `/api/store/orders/[id]/refund` | POST | Issue Square refund |
| `/api/admin/inbox/[id]/read` | PATCH | Mark inbox message as read |
| `/api/admin/reply-inbox` | POST | Reply to inbox message |
| `/api/admin/reply-lead` | POST | Reply to contact form lead |
| `/api/admin/newsletter/send` | POST | Send newsletter to all confirmed subscribers |
| `/api/admin/test-email` | POST | Send test email |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/[id]` | PATCH, DELETE | Update or delete a user |
| `/api/cron/reminders` | GET | Vercel cron — sends 24h appointment reminders |

---

## External Integrations

### Square (Payments)

- **What it does:** Processes plant purchase payments and refunds via Square Web Payments SDK
- **Env vars:** `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_SANDBOX_ACCESS_TOKEN`, `SQUARE_SANDBOX_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`
- **Where to find creds:** developer.squareup.com → Applications → Maytees Garden Center
- **Sandbox test card:** `4111 1111 1111 1111`, any future expiry, any CVV
- **Free tier:** No monthly fee; 2.6% + 10¢ per card-present, 2.9% + 30¢ online

### Shippo (Shipping)

- **What it does:** Fetches real-time shipping rates at checkout; admin can purchase labels for fulfilled orders
- **Env vars:** `SHIPPO_API_KEY`, `SHIPPO_TEST_API_KEY` (optional, local only)
- **Where to find creds:** goshippo.com → API
- **Fallback:** If `SHIPPO_API_KEY` is not set, `getRates()` returns an empty array — checkout shows no rate options
- **Free tier:** Pay-per-label; no monthly fee

### Resend (Transactional Email)

- **What it does:** Sends all transactional emails — booking confirmations, order confirmations, reminders, welcome emails, newsletter, password reset
- **Env vars:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Where to find creds:** resend.com → API Keys
- **From address:** Must be on a verified Resend domain (`mayteesgardencenter.com`)
- **Free tier:** 3,000 emails/month, 100 emails/day
- **Safe fallback:** If `RESEND_API_KEY` is not set, all email functions log to console and return without error

### Anthropic Claude (AI Chat)

- **What it does:** Powers the AI chat bubble (bottom-right on all pages); answers questions about plants, services, and garden care
- **Env vars:** `ANTHROPIC_API_KEY`
- **Where to find creds:** console.anthropic.com → API Keys
- **Free tier:** No free tier; pay-per-token

### Microsoft Graph (Calendar Sync)

- **What it does:** Creates/updates/deletes events in the `info@mayteesgardencenter.com` Outlook calendar when admin confirms, edits, or cancels a booking
- **Env vars:** `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_CALENDAR_USER`
- **Where to find creds:** portal.azure.com → App registrations → "Maytees Garden Calendar"
- **Auth flow:** Client credentials (app-to-app, no user sign-in required)
- **Required permission:** `Calendars.ReadWrite` (Application permission, admin-consented)
- **Safe fallback:** If credentials are not set, calendar sync is silently disabled — bookings still work
- **Setup:** See `src/lib/microsoft-graph.ts` for step-by-step Azure setup instructions

### Neon (PostgreSQL)

- **What it does:** Serverless PostgreSQL database (production)
- **Where to find creds:** console.neon.tech → Project → Connection string
- **Schema changes:** Must run `npx prisma db push` manually with the Neon URL — not automated in deploys
- **Free tier:** 0.5 GB storage, 1 compute unit

### Vercel

- **What it does:** Hosts the Next.js app; runs cron job for appointment reminders
- **Cron schedule:** `0 10 * * *` (daily at 10:00 UTC) → hits `/api/cron/reminders`
- **Cron auth:** Vercel passes `Authorization: Bearer [CRON_SECRET]` header automatically
- **Free tier:** Hobby plan supports 1 cron per project, 60s execution limit

### GoDaddy

- **What it does:** Domain registrar for `mayteesgardencenter.com`; also hosts Microsoft 365 email for `info@mayteesgardencenter.com`
- **DNS:** Currently points to the `maytees-coming-soon` Vercel project
- **Future:** DNS A/CNAME records will be updated to point to main app when ready

---

## Deployment

### Auto-deploy

Every push to the `main` branch on GitHub triggers an automatic Vercel build and deployment. Vercel runs:

```bash
prisma generate && next build
```

### Updating the Production Database Schema

Schema changes are **not** applied automatically on deploy. After editing `prisma/schema.prisma`, run:

```bash
DATABASE_URL="[your-neon-connection-string]" npx prisma db push --accept-data-loss
```

Run this before or after deploying, depending on whether the new code requires the schema change to exist first.

### Vercel Cron

The cron configuration in `vercel.json` runs the reminder check daily:

```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "0 10 * * *" }]
}
```

The endpoint requires `Authorization: Bearer [CRON_SECRET]`. Vercel injects this header automatically; set `CRON_SECRET` in Vercel environment variables.

---

## Known Limitations

- **Etsy sync (Phase 2):** The `Plant` model has `etsyListingId` and `etsyLastSync` fields, and `StoreOrder` has `etsyOrderId`. Etsy API sync logic is not yet built. Planned for Phase 2.
- **Microsoft Graph credentials needed:** Calendar sync to Outlook is fully implemented but requires the Azure AD app to be configured. Without credentials, it silently does nothing.
- **`NEXTAUTH_URL` needs updating:** When `mayteesgardencenter.com` DNS is pointed to the main app, update `NEXTAUTH_URL` in Vercel environment variables and redeploy.
- **`prisma migrate dev` is broken locally:** Shadow DB configuration does not work with the current setup. Always use `prisma db push` instead.
- **Newsletter subscriber management:** The admin UI shows confirmed subscriber count and allows sending newsletters, but removing individual subscribers from the UI is not yet implemented (use Prisma Studio or direct DB query for now).
