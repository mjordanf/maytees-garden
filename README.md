# 🌿 Maytee's Garden Center — Website & Portal

A fully-featured Next.js 14 web platform for Maytee's Garden Center in Miami, FL. Includes a public marketing website, customer portal, admin panel, AI chat assistant, booking system, and bilingual EN/ES support.

---

## 📋 Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** v9+
- An **Anthropic API key** for the AI chat assistant ([get one here](https://console.anthropic.com))
- That's it — the database is SQLite (no separate database install needed)

---

## 🚀 Quick Start (5 steps)

### Step 1 — Clone / unzip the project

```bash
cd maytees-garden
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-random-secret"   # generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-key-here"      # from console.anthropic.com
```

### Step 4 — Initialize the database

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### Step 5 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 Test Credentials

After seeding, these accounts are ready to use:

| Role        | Email                          | Password       |
|-------------|-------------------------------|----------------|
| 👑 Admin     | `maytee@mayteesgarden.com`     | `Admin2024!`   |
| 🧑‍💼 Staff  | `staff@mayteesgarden.com`      | `Staff2024!`   |
| 👤 Customer | `test@customer.com`            | `Customer2024!`|

---

## 📁 Project Structure

```
maytees-garden/
├── prisma/
│   ├── schema.prisma        # Complete data models
│   ├── seed.ts              # Sample data (plants, services, users, bookings)
│   └── dev.db               # Created automatically on first migrate
├── messages/
│   ├── en.json              # English translations
│   └── es.json              # Spanish translations
├── src/
│   ├── app/
│   │   ├── page.tsx         # 🏠 Home page (hero, plants, services, testimonials)
│   │   ├── about/           # 👤 About Maytee + TV appearances + timeline
│   │   ├── plants/          # 🪴 Plant catalog with search + filtering
│   │   ├── services/        # 🛠 Services showcase
│   │   ├── gallery/         # 📸 Project gallery
│   │   ├── contact/         # 📬 Contact form → stored in DB
│   │   ├── booking/         # 📅 Interactive booking calendar
│   │   ├── auth/
│   │   │   ├── login/       # 🔐 Login page
│   │   │   └── register/    # ✍️ Registration page
│   │   ├── portal/          # 🧑 Customer portal (auth-gated)
│   │   │   ├── page.tsx     #   Dashboard with stats + upcoming appointments
│   │   │   ├── favorites/   #   Saved plants
│   │   │   ├── appointments/#   Booking history & upcoming
│   │   │   ├── orders/      #   Order history
│   │   │   └── settings/    #   Profile + language + marketing prefs
│   │   ├── admin/           # 🛡 Admin panel (admin/staff only)
│   │   │   ├── page.tsx     #   Dashboard with metrics
│   │   │   ├── bookings/    #   Manage all appointments + change status
│   │   │   ├── plants/      #   CRUD plant catalog
│   │   │   ├── users/       #   Customer database + CSV export
│   │   │   ├── leads/       #   Contact form submissions + newsletter
│   │   │   └── logs/        #   Audit trail (read-only)
│   │   └── api/
│   │       ├── auth/        # NextAuth.js handler + registration
│   │       ├── bookings/    # GET / POST / PATCH bookings
│   │       ├── contact/     # POST contact form submissions
│   │       ├── favorites/   # GET / POST / DELETE favorites
│   │       └── chat/        # Server-side Anthropic AI chat
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx   # Responsive nav + language switcher + auth dropdown
│   │   │   └── Footer.tsx   # 4-column footer + newsletter signup
│   │   └── chat/
│   │       └── AIChatWidget.tsx  # Floating AI chat bubble
│   └── lib/
│       ├── prisma.ts        # Prisma client singleton
│       ├── auth.ts          # NextAuth config (Credentials provider + RBAC)
│       ├── i18n.tsx         # EN/ES context provider + useI18n hook
│       └── utils.ts         # cn(), formatCurrency(), care level labels, etc.
```

---

## 🗄 Database Commands

| Command | What it does |
|---------|-------------|
| `npm run db:migrate` | Apply schema migrations (creates/updates tables) |
| `npm run db:seed` | Seed sample data (plants, services, users, etc.) |
| `npm run db:reset` | ⚠️ Drop everything and re-seed from scratch |
| `npm run db:studio` | Open Prisma Studio visual DB browser at localhost:5555 |
| `npx prisma generate` | Regenerate Prisma client after schema changes |

---

## 🌍 Language Support

The site ships with full English and Spanish translations in `messages/`. The language switcher in the Navbar toggles between them.

To add a new language:
1. Create `messages/fr.json` (copy `en.json` structure)
2. Add `'fr'` to the `Lang` type in `src/lib/i18n.tsx`
3. Import and add the new messages file

---

## 🤖 AI Chat Assistant

The floating chat widget in the bottom-right corner connects to the Anthropic API (server-side, key never exposed to browser). It's configured as a South Florida gardening expert with full knowledge of Maytee's services, plants, and booking system.

**If `ANTHROPIC_API_KEY` is not set**, the chat gracefully falls back to a "call us" message instead of crashing.

---

## 📸 Images & Media

All images currently use **Unsplash placeholder photos** appropriate for each plant/garden context. To replace them with real media from Maytee's Instagram:

1. Download photos from [@maytees_garden_center](https://www.instagram.com/maytees_garden_center/)
2. Place them in `public/images/`
3. Update `imageUrl` values in `prisma/seed.ts`
4. Run `npm run db:reset` to reload seed data

---

## 🏗 Pages Overview

| URL | Page | Auth Required |
|-----|------|--------------|
| `/` | Home | No |
| `/plants` | Plant Catalog | No (favorites require login) |
| `/services` | Services | No |
| `/gallery` | Gallery | No |
| `/about` | About Maytee | No |
| `/contact` | Contact Form | No |
| `/booking` | Book a Consultation | No |
| `/auth/login` | Login | No |
| `/auth/register` | Register | No |
| `/portal` | Customer Dashboard | ✅ Customer+ |
| `/portal/favorites` | Saved Plants | ✅ Customer+ |
| `/portal/appointments` | My Bookings | ✅ Customer+ |
| `/portal/orders` | Order History | ✅ Customer+ |
| `/portal/settings` | Account Settings | ✅ Customer+ |
| `/admin` | Admin Dashboard | ✅ Admin/Staff only |
| `/admin/bookings` | Booking Manager | ✅ Admin/Staff only |
| `/admin/plants` | Plant CMS | ✅ Admin/Staff only |
| `/admin/users` | Customer List | ✅ Admin/Staff only |
| `/admin/leads` | Contact Leads | ✅ Admin/Staff only |
| `/admin/logs` | Audit Logs | ✅ Admin only |

---

## 🎨 Design System

- **Primary color:** Green `#2d6a4f` (deep Miami tropical)
- **Accent color:** Terracotta `#bc4b35` (warm, artisanal)
- **Background:** Cream `#faf7f2`
- **Heading font:** Playfair Display (Google Fonts)
- **Body font:** Inter (Google Fonts)

---

## 🚢 Deployment

For production deployment to Vercel:

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Change `DATABASE_URL` to a PostgreSQL URL (e.g., Supabase or Neon — both free tier available)
5. Update Prisma datasource: `provider = "postgresql"` in `prisma/schema.prisma`

---

## 📝 Notes

- The project uses **SQLite** for local development — zero setup needed
- For production, switch to **PostgreSQL** (Supabase free tier recommended)
- Admin plant CRUD is scaffolded — full create/edit forms can be added as next phase
- Password recovery email requires adding an email provider (e.g., Resend, SendGrid)

---

**Built for Maytee's Garden Center · Miami, FL · @maytees_garden_center**
