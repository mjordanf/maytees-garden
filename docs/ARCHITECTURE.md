# Architecture

## System Overview

Maytee's Garden Center is a monolithic Next.js 14 application deployed on Vercel. It is a single codebase that serves both the public-facing marketing and e-commerce site and the internal admin panel. All server-side logic lives in Next.js App Router API routes. The database is a serverless Neon PostgreSQL instance accessed via Prisma ORM. Third-party services handle payments (Square), shipping (Shippo), email (Resend), AI chat (Anthropic), and calendar sync (Microsoft Graph / Outlook).

---

## Infrastructure Diagram

```
GitHub (mjordanf/maytees-garden)
    │ push to main → auto-deploy
    ▼
Vercel (maytees-garden.vercel.app)
    │          │           │
    │          │           └── Static assets (public/gallery/*, public/images/*)
    │          ▼
    │      Neon PostgreSQL (serverless, ep-dark-queen-*)
    │          └── 14 models: User, Plant, Booking, StoreOrder, ...
    │
    ├── Square API          (payments + refunds)
    ├── Shippo API          (shipping rates + label purchase)
    ├── Resend              (transactional email — all triggers)
    ├── Anthropic Claude    (AI chat widget)
    ├── Microsoft Graph     (Outlook calendar sync)
    └── [Planned] Etsy API  (inventory + order sync — Phase 2)

Vercel Cron (daily 10:00 UTC)
    └── GET /api/cron/reminders → checkAndSendReminders()

GoDaddy DNS → mayteesgardencenter.com
    ├── → Vercel project "maytees-coming-soon" (active now)
    └── [Future] → main app when DNS is updated

GoDaddy Microsoft 365: info@mayteesgardencenter.com
    └── Azure AD App Registration ("Maytees Garden Calendar")
        └── Calendars.ReadWrite (Application permission, admin-consented)
            └── → Microsoft Graph API → Outlook calendar
```

---

## Application Layers

### Public Website

Marketing and e-commerce pages accessible without authentication.

| Route | Purpose |
|---|---|
| `/` | Home — hero, featured plants, services overview, testimonials |
| `/about` | About Maytee, her philosophy and background |
| `/services` | Landscape services listing |
| `/plants` | Plant catalog with search, tag filter, category filter, favoriting, add to cart |
| `/gallery` | Project photo gallery |
| `/contact` | Contact form → `ContactSubmission` + admin alert email |
| `/booking` | Multi-step consultation booking wizard |
| `/shop/cart` | Cart review (localStorage-based) |
| `/shop/checkout` | Three-step checkout: address → Shippo rates → Square payment |
| `/shop/order/[id]` | Order confirmation with ICS download |
| `/newsletter/*` | Double opt-in newsletter confirmation/unsubscribe flow |

### Auth

| Route | Purpose |
|---|---|
| `/auth/login` | Credentials login via NextAuth |
| `/auth/register` | New account creation |
| `/auth/forgot-password` | Initiate password reset |
| `/auth/reset-password` | Complete password reset with token |

### Customer Portal (`/portal/*`)

Requires any authenticated session. Protected by `src/app/portal/layout.tsx` which calls `getServerSession()` and redirects to `/auth/login?callbackUrl=/portal` if no session.

| Route | Purpose |
|---|---|
| `/portal` | Dashboard |
| `/portal/favorites` | Saved/hearted plants |
| `/portal/appointments` | Booking history with ICS download, message, and cancel |
| `/portal/orders` | Store order history |
| `/portal/messages` | Send messages to Maytee |
| `/portal/settings` | Language preference, newsletter opt-in, profile |

### Admin Panel (`/admin/*`)

Protected by `src/app/admin/layout.tsx`. Requires role `admin`, `staff`, or `superadmin`. Redirects to `/` if unauthorized.

| Route | Purpose |
|---|---|
| `/admin` | Stats dashboard |
| `/admin/inbox` | All messages: customer messages, booking alerts, contact forms, order alerts |
| `/admin/bookings` | View/filter/confirm/edit/cancel bookings |
| `/admin/availability` | Weekly schedule + blocked dates |
| `/admin/orders` | View/filter/ship/cancel store orders |
| `/admin/plants` | CRUD plant catalog, inline stock editing |
| `/admin/users` | View customer list |
| `/admin/leads` | Contact form replies + newsletter management |
| `/admin/logs` | Audit log viewer |
| `/admin/test-email` | Test Resend pipeline (not in sidebar nav) |

### Super Admin (`/superadmin/*`)

Protected by `src/app/superadmin/layout.tsx`. Requires role `superadmin` exactly. Redirects to `/auth/login` if unauthorized. Dark-themed separate UI.

| Route | Purpose |
|---|---|
| `/superadmin` | Dashboard |
| `/superadmin/users` | Create, edit, role-change, delete any user |
| `/superadmin/settings` | Website settings (read-only currently) |

---

## Database Models

All 14 models are defined in `prisma/schema.prisma`. The database provider is PostgreSQL. All IDs use CUID.

### User
Central authentication model. Stores credentials (bcrypt `passwordHash`), role, language preference, newsletter opt-in. Relations: bookings, favorites, orders (legacy), storeOrders, inboxMessages, auditLogs.

**Key fields:** `id`, `email` (unique), `passwordHash`, `role` (customer/staff/admin/superadmin), `languagePreference`, `newsletterOptIn`, `promotionsOptIn`, `phone`, `zipCode`

### Account / Session / VerificationToken
NextAuth.js adapter tables. Not used directly in application code — managed by the NextAuth PrismaAdapter.

### Plant
The product catalog. Supports both in-store and online selling with separate stock counters.

**Key fields:** `nameEn`, `nameEs`, `descriptionEn`, `descriptionEs`, `price`, `imageUrl`, `category` (tropical/flowering/palms/succulents/edible/native), `onlineStock`, `onsiteStock`, `onlinePrice` (nullable, overrides `price` for online), `weight`, `shippingClass`, `tags` (comma-separated), `careLevel`, `sunlight`, `water`, `featured`

**Planned fields (Etsy):** `etsyListingId`, `etsyLastSync`

### Service
Consultation service types offered. Used in the booking wizard.

**Key fields:** `nameEn`, `nameEs`, `descriptionEn`, `descriptionEs`, `price` (nullable), `priceNote`, `duration` (minutes), `active`

### Booking
A consultation request from a customer. Created on booking form submission; confirmed by admin.

**Key fields:** `userId` (nullable — guests can book), `serviceId`, `appointmentDate`, `status` (pending/confirmed/completed/cancelled), `clientName`, `clientEmail`, `clientPhone`, `customerPreference` (in-person/facetime/whatsapp/google-meet), `consultationType` (set by admin on confirm), `videoCallLink`, `slotDate`, `slotStart`, `slotEnd`, `calendarEventId`, `calendarSynced`, `reminderSent`

### Order
Legacy order model (pre-store). Kept for backward compatibility.

**Key fields:** `userId`, `total`, `status`, `items` (OrderItem[])

### OrderItem
Line items for the legacy Order model.

### Favorite
Many-to-many junction between User and Plant. Unique on `[userId, plantId]`.

### ContactSubmission
Contact form submissions from the public `/contact` page.

**Key fields:** `name`, `email`, `phone`, `service`, `message`, `status` (new/read/replied/archived)

### NewsletterSubscriber
Double opt-in subscriber list. Separate from User accounts.

**Key fields:** `email` (unique), `name`, `active`, `confirmed`, `confirmToken` (unique), `unsubscribeToken` (unique, default cuid)

### GalleryItem
Static gallery items for the `/gallery` page.

**Key fields:** `imageUrl`, `captionEn`, `captionEs`, `category`, `featured`, `sortOrder`

### Testimonial
Customer testimonials displayed on the home page.

**Key fields:** `name`, `location`, `rating`, `textEn`, `textEs`, `imageUrl`, `featured`

### AuditLog
Application audit trail. Written whenever significant admin actions occur.

**Key fields:** `userId` (nullable), `action`, `entity`, `entityId`, `details`

### PasswordResetToken
Single-use tokens for password reset flow. Expire after 1 hour.

**Key fields:** `token` (unique), `email`, `expiresAt`, `used`

### InboxMessage
Unified admin inbox. Aggregates all inbound communications.

**Key fields:** `fromUserId` (nullable), `bookingId` (nullable), `subject`, `body`, `read`, `type` (customer-message/booking-alert/contact-form/order-alert)

### StoreOrder
An e-commerce order placed through the plant shop. Linked to Square payment and Shippo label.

**Key fields:** `orderNumber` (unique), `userId` (nullable — guests can order), `status` (pending/processing/shipped/cancelled), `customerName`, `customerEmail`, shipping address fields, `shippingCarrier`, `shippingService`, `shippingCost`, `trackingNumber`, `shippoLabelUrl`, `squarePaymentId`, `squareOrderId`, `subtotal`, `tax`, `total`, `channel` (website/etsy), `etsyOrderId`

### StoreOrderItem
Line items for StoreOrder. Denormalizes `plantName` at order time so it survives plant renames/deletes.

**Key fields:** `orderId`, `plantId`, `plantName`, `qty`, `unitPrice`, `total`

### AvailabilityTemplate
Recurring weekly schedule for consultation bookings.

**Key fields:** `dayOfWeek` (0=Sun through 6=Sat), `startTime` (HH:MM), `endTime` (HH:MM), `slotMinutes`, `isActive`, `type` (in-person/video/both)

### AvailabilityOverride
One-off date-level overrides: blocked dates or custom hours.

**Key fields:** `date`, `isBlocked`, `startTime`, `endTime`, `reason`

---

## Authentication

NextAuth.js v4 with JWT session strategy. No OAuth providers — credentials only (email + bcrypt password).

### Configuration (`src/lib/auth.ts`)

- Provider: `CredentialsProvider`
- Session: `{ strategy: 'jwt' }`
- On login: finds User by email, compares bcrypt hash
- JWT callback: injects `token.id` and `token.role`
- Session callback: exposes `session.user.id` and `session.user.role`
- Login page: `/auth/login`

### Role Hierarchy

```
customer < staff < admin < superadmin
```

- **customer:** Portal access only
- **staff:** Admin panel access (same as admin)
- **admin:** Full admin panel access
- **superadmin:** Admin panel + `/superadmin/*` exclusive access

### Route Protection

| Area | Guard | Redirect on fail |
|---|---|---|
| `/portal/*` | `portal/layout.tsx` — `getServerSession()` checks for any session | `/auth/login?callbackUrl=/portal` |
| `/admin/*` | `admin/layout.tsx` — checks role is admin/staff/superadmin | `/` (home) |
| `/superadmin/*` | `superadmin/layout.tsx` — checks role is exactly superadmin | `/auth/login` |

Admin API routes (`/api/admin/*`, `/api/store/orders/*`) call `getServerSession(authOptions)` and check role inline.

---

## Key Data Flows

### 1. Consultation Booking

```
Customer fills booking form (/booking)
    │
    ▼
GET /api/availability/slots?date=YYYY-MM-DD
    │  → reads AvailabilityTemplate + AvailabilityOverride + existing Bookings
    │  → returns available time slots
    ▼
Customer selects slot + meeting preference + contact info
    │
    ▼
POST /api/bookings
    │  → creates Booking { status: "pending" }
    │  → sendBookingConfirmation()   → Resend → customer
    │  → sendBookingAlert()          → Resend → info@mayteesgardencenter.com
    │  → creates InboxMessage { type: "booking-alert" }
    ▼
Admin sees unread badge in /admin/inbox
    │
    ▼
Admin goes to /admin/bookings → clicks Confirm
    │  → sets consultationType + videoCallLink (if video)
    │  → PATCH /api/store/orders/[id] (or bookings endpoint)
    │  → Booking.status = "confirmed"
    │  → createCalendarEvent()        → Microsoft Graph → Outlook calendar
    │  → Booking.calendarEventId saved, calendarSynced = true
    │  → sendBookingConfirmedInPerson() or sendBookingConfirmedVideo()
    │                                  → Resend → customer
    ▼
If admin edits confirmed booking:
    │  → updateCalendarEvent()        → Microsoft Graph
    │  → sendBookingUpdated()         → Resend → customer

If customer cancels (/portal/appointments):
    │  → Booking.status = "cancelled"
    │  → deleteCalendarEvent()        → Microsoft Graph
    │  → sendBookingCancelledNotice() → Resend → admin
```

### 2. Plant Purchase (E-commerce)

```
Customer adds plants to cart
    │  → CartProvider (localStorage only, clears on logout)
    ▼
/shop/cart → /shop/checkout (Step 1: Shipping Address)
    │
    ▼
Step 2: Shipping Rates
    │  → POST /api/store/shipping-rates
    │  → shippo.getRates(toAddress, parcel)
    │  → returns carrier options (or flat-rate fallback if Shippo not configured)
    ▼
Step 3: Payment
    │  → Square Web Payments SDK tokenizes card → sourceId
    │  → POST /api/store/checkout
    │     ├── validates stock (onlineStock >= qty)
    │     ├── creates StoreOrder { status: "pending" }
    │     ├── square.createSquarePayment({ sourceId, amountCents })
    │     │   └── on success: StoreOrder.squarePaymentId saved
    │     ├── decrements Plant.onlineStock for each item
    │     ├── StoreOrder.status = "processing"
    │     ├── sendOrderConfirmation() → Resend → customer
    │     └── sendOrderAlert()        → Resend → admin
    ▼
Customer sees /shop/order/[id] with ICS download option
    │
    ▼
Admin at /admin/orders:
    │  → Generate Shipping Label:
    │     POST /api/store/orders/[id]/label
    │     → shippo.purchaseLabel(rateId)
    │     → StoreOrder.shippoLabelUrl + trackingNumber saved
    │
    │  → Mark Shipped:
    │     PATCH /api/store/orders/[id] { status: "shipped" }
    │     → sendShippingConfirmation() → Resend → customer
    │
    │  → Refund / Cancel:
    │     POST /api/store/orders/[id]/refund
    │     → square.refundSquarePayment(paymentId, amountCents)
```

### 3. User Registration

```
POST /api/auth/register
    │  → validates email uniqueness
    │  → bcrypt.hash(password, 10)
    │  → creates User { role: "customer" }
    │  → if newsletterOptIn: creates NewsletterSubscriber { confirmed: false }
    │     → sendNewsletterConfirmation() → Resend → new subscriber
    │  → sendWelcomeEmail() → Resend → new user
    ▼
User lands at /portal (redirected after login)
```

### 4. Cron Reminder Emails

```
Vercel cron (daily 10:00 UTC)
    │  → GET /api/cron/reminders
    │  → verifies Authorization: Bearer [CRON_SECRET]
    ▼
checkAndSendReminders()
    │  → queries Bookings where:
    │     status = "confirmed"
    │     reminderSent = false
    │     appointmentDate BETWEEN (now + 24h) AND (now + 25h)
    │
    │  For each matching booking:
    │     → sendReminderEmail() → Resend → customer
    │     → Booking.reminderSent = true
    ▼
Returns count of reminders sent
```

---

## Email Triggers

All email functions live in `src/lib/email.ts`. All send from `Maytee's Garden <[RESEND_FROM_EMAIL]>`.

| Trigger | Function | To | Subject |
|---|---|---|---|
| Booking form submitted | `sendBookingConfirmation()` | Customer | "Your consultation request is received" |
| Booking form submitted | `sendBookingAlert()` | Admin | "New Booking — [Name] · [Service]" |
| Admin confirms booking (in-person) | `sendBookingConfirmedInPerson()` | Customer | "Your appointment is confirmed" |
| Admin confirms booking (video) | `sendBookingConfirmedVideo()` | Customer | "Your video consultation is confirmed" |
| Admin edits confirmed booking | `sendBookingUpdated()` | Customer | "Your appointment has been updated" |
| Customer cancels booking | `sendBookingCancelledNotice()` | Admin | "Appointment Cancelled — [Name]" |
| Customer sends portal message | `sendCustomerMessageAlert()` | Admin | "Message from [Name] re: their appointment" |
| Admin replies to lead | `sendLeadReply()` | Lead (contact form submitter) | [Admin-chosen subject] |
| Newsletter subscribe | `sendNewsletterConfirmation()` | Subscriber | "Confirm your subscription" |
| Admin sends newsletter | `sendNewsletter()` | Each confirmed subscriber | [Admin-chosen subject] |
| New user registration | `sendWelcomeEmail()` | New user | "Welcome to Maytee's Garden!" |
| Order placed | `sendOrderConfirmation()` | Customer | "Your order is confirmed — [orderNumber]" |
| Order placed | `sendOrderAlert()` | Admin | "New Order — [orderNumber]" |
| Order shipped | `sendShippingConfirmation()` | Customer | "Your order [orderNumber] has shipped!" |
| Cron (24h before appointment) | `sendReminderEmail()` | Customer | "Reminder: Your consultation tomorrow" |
| Forgot password | `sendPasswordResetEmail()` | User | "Reset your password" |

---

## Calendar Sync Lifecycle

Calendar sync uses Microsoft Graph API with client credentials flow (no user sign-in required). The Azure AD app "Maytees Garden Calendar" has `Calendars.ReadWrite` application permission on the `info@mayteesgardencenter.com` mailbox.

```
MICROSOFT_TENANT_ID + MICROSOFT_CLIENT_ID + MICROSOFT_CLIENT_SECRET
    │
    ▼
getAccessToken()
    POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
    grant_type=client_credentials
    scope=https://graph.microsoft.com/.default
    │
    ▼ access_token (valid ~1 hour, fetched fresh each time)
    │
    ├── createCalendarEvent(booking)
    │   POST /users/{CALENDAR_USER}/events
    │   → returns eventId → saved as Booking.calendarEventId
    │
    ├── updateCalendarEvent(eventId, booking)
    │   PATCH /users/{CALENDAR_USER}/events/{eventId}
    │
    └── deleteCalendarEvent(eventId)
        DELETE /users/{CALENDAR_USER}/events/{eventId}
```

**When each function is called:**

| Action | Calendar function |
|---|---|
| Admin confirms booking | `createCalendarEvent()` |
| Admin edits confirmed booking | `updateCalendarEvent()` |
| Admin cancels booking | `deleteCalendarEvent()` |
| Customer cancels booking | `deleteCalendarEvent()` |

Each calendar event includes: customer name, email, phone, ZIP, service name, consultation type, video link (if applicable), customer notes, admin internal notes, and a 60-minute reminder.

**If credentials are not configured:** `isConfigured()` returns false and all Graph functions return `null`/`false` without throwing. Bookings continue to work; calendar events are simply not created.
