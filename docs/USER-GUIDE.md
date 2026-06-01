# User Guide

This guide is written as a walkthrough script — suitable for a demo, video recording, or training session. Each section describes what to click, what to expect on screen, and common gotchas.

---

## Customer Flows

---

### Flow 1: Public Website Navigation

**Narration:** Start at the home page and orient yourself to the site.

**Steps:**
1. Open https://maytees-garden.vercel.app. The home page loads with a hero image, featured plants carousel, services overview, testimonials, and a newsletter sign-up at the bottom.
2. Click **Plants** in the top navigation. You land on the full plant catalog.
3. Click **Services** in the top navigation. You see the landscape consultation services offered.
4. Click **Gallery** in the top navigation. You see project photos from completed landscaping work.
5. Click **About** in the top navigation. You see Maytee's story and business background.
6. Click **Contact** in the top navigation. You see the contact form.
7. The **Navbar** also shows a cart icon (with item count badge when the cart has items) and a Sign In button when logged out.

**Tips:**
- The site is bilingual (EN/ES). Language toggle is in the customer portal settings, not in the public nav.
- The footer contains business address (15196 SW 184th St, Miami, FL 33187), phone, and quick links.

---

### Flow 2: AI Chat Widget

**Narration:** Demonstrate the AI-powered chat assistant.

**Steps:**
1. On any page, look for the green chat bubble in the **bottom-right corner**.
2. Click it. A chat panel slides open with a greeting from Maytee's Garden virtual assistant.
3. Type a question such as: "What plants do you have that are good for full sun?" or "How much do your garden consultations cost?"
4. The assistant responds using Claude (Anthropic). It has context about the business and can discuss plants, services, and garden care.
5. Click the X or chat bubble again to close the panel.

**Tips:**
- The assistant is powered by Anthropic's Claude API. If `ANTHROPIC_API_KEY` is not set, the chat endpoint will error.
- The chat does not have memory across sessions — each page load starts fresh.

---

### Flow 3: Account Creation and Login

**Narration:** Walk through creating a new account and logging in.

**Steps:**
1. Click **Sign In** in the top navigation.
2. On the login page, click **Create an account** (or navigate to `/auth/register`).
3. Fill in: Full name, email address, password (8+ characters), phone (optional).
4. Check **Sign me up for the newsletter** if desired (enables double opt-in flow).
5. Click **Create Account**.
6. You are logged in and redirected to the customer portal (`/portal`).
7. Check the inbox — a welcome email is sent to the registered email address (if Resend is configured).
8. To log in next time: click Sign In, enter email and password, click **Sign In**.
9. After login, the navbar shows the user's name and a **My Account** link.

**Tips:**
- Admin users land on the portal but also see an **Admin Panel** link in the portal sidebar.
- Password reset is available via the "Forgot your password?" link on the login page — sends a 1-hour reset link by email.

---

### Flow 4: Plant Catalog

**Narration:** Show the plant browsing and filtering experience.

**Steps:**
1. Navigate to `/plants`.
2. The page shows all available plants in a card grid. Each card shows: plant photo, name (EN), category badge, price, and a stock indicator.
3. **Search:** Type in the search box at the top to filter by plant name.
4. **Filter by category:** Click a category pill (Tropical, Flowering, Palms, Succulents, Edible, Native) to filter the grid.
5. **Filter by tag:** Tags appear as small pills on each card; clicking a tag filters to matching plants.
6. **Favorite a plant:** Click the heart icon on any plant card. If logged in, the plant is saved to your favorites. If logged out, you are prompted to log in.
7. **Stock badge:** Green = in stock, amber = low stock (1–3), red = out of stock. Out-of-stock plants show a disabled Add to Cart button.
8. **Add to Cart:** Click **Add to Cart** on any in-stock plant. The cart icon in the navbar updates with the item count.

**Tips:**
- Plant cards display `onlinePrice` if set; otherwise they fall back to `price`.
- The catalog pulls from the `Plant` model's `onlineStock` field, not `stockQty`.

---

### Flow 5: Cart and Checkout

**Narration:** Walk through the full checkout flow.

**Steps:**
1. Add a plant to the cart from `/plants`.
2. Click the cart icon in the navbar, or navigate to `/shop/cart`.
3. **Cart page:** Review items. Use the quantity spinner (+/−) to change quantities (capped at available online stock). Click the trash icon to remove an item. See subtotal at the bottom.
4. Click **Proceed to Checkout**.

**Step 1 — Shipping Address:**
5. Fill in: Full name, email, phone (optional), street address, city, state, ZIP, country.
6. Click **Continue to Shipping**.

**Step 2 — Shipping Options:**
7. The page calls Shippo to fetch real carrier rates. Available rates appear as radio button options showing carrier, service level, price, and estimated days.
8. Select a shipping method.
9. Click **Continue to Payment**.

**Step 3 — Payment:**
10. The Square Web Payments SDK card form renders.
11. In sandbox mode, use test card: `4111 1111 1111 1111`, any future expiry (e.g., 12/26), any CVV (e.g., 123), any ZIP.
12. Click **Place Order**.
13. The order is created, Square payment is captured, and stock is decremented.
14. You are redirected to `/shop/order/[id]`.

**Tips:**
- Cart data is stored in `localStorage`. It is not linked to your user account — it clears on logout.
- If Shippo returns no rates (not configured, or address issue), the shipping step shows no options and you cannot proceed. This is the most common failure point in checkout.
- Square must be in the correct environment (`SQUARE_ENVIRONMENT=sandbox` for test, `production` for live). Using a sandbox card against a production Square account will fail silently.

---

### Flow 6: Order Confirmation

**Narration:** Show the order confirmation page after purchase.

**Steps:**
1. After a successful checkout, you land on `/shop/order/[id]`.
2. The page shows: order number, itemized list with quantities and prices, subtotal, shipping cost, tax, and total.
3. Shipping address is shown.
4. An **Add to Calendar** button downloads an `.ics` file that customers can import into any calendar app.
5. A link to continue shopping is shown.

**On screen to show:** The order number (format: `MG-XXXXXX`), the full order summary, and the ICS download button.

**Tips:**
- The order confirmation page does not require login. The order ID in the URL is the only access control.
- The customer and admin both receive email confirmations immediately after the order.

---

### Flow 7: Booking a Consultation

**Narration:** Walk through the multi-step consultation booking form.

**Steps:**
1. Navigate to `/booking` (or click **Book a Consultation** from the Services page).

**Step 1 — Choose a Service:**
2. A list of active services is displayed. Each shows name, description, duration, and price.
3. Click a service to select it. Click **Next**.

**Step 2 — Choose a Date and Time:**
4. A calendar is shown. Only dates that have available slots (based on the admin's weekly schedule and blocked dates) are clickable. Past dates are grayed out.
5. Click an available date. Time slots for that date appear below the calendar.
6. Select a time slot. The slot type (in-person, video, or both) determines which meeting preferences appear in the next step.
7. Click **Next**.

**Step 3 — Meeting Preference:**
8. Options shown depend on the slot type. For "both" slots: In-Person Visit, FaceTime, WhatsApp Video, Google Meet. For "in-person" only slots: only In-Person. For "video" only: only video options.
9. Select your preference. Click **Next**.

**Step 4 — Contact Information:**
10. Fill in: Full name, email, phone (optional), ZIP code (optional), additional notes (optional).
11. If logged in, name and email are pre-filled from the account.
12. Click **Request Consultation**.
13. A confirmation screen appears. The customer receives a pending confirmation email.

**Tips:**
- Booking is allowed without an account (guest booking). If logged in, the booking is linked to the user account and appears in the portal.
- The booking is created with `status: "pending"`. It does not appear as "confirmed" until admin action.
- The calendar availability check happens in real time — if two people book the same slot simultaneously, the second will see the slot disappear.

---

### Flow 8: Customer Portal Dashboard

**Narration:** Overview of the customer portal.

**Steps:**
1. Log in and navigate to `/portal`.
2. The portal sidebar shows: Dashboard, Saved Plants, My Appointments, Order History, Message Maytee, Account Settings.
3. The dashboard shows a summary: upcoming appointments, recent orders, saved plant count.
4. The user's name and email are shown at the top of the sidebar.

**On screen to show:** The clean sidebar layout with the leaf icon, user name/email, and the quick stat cards on the dashboard.

---

### Flow 9: Saved Plants

**Narration:** Show the favoriting system.

**Steps:**
1. Navigate to `/portal/favorites`.
2. Plants you have hearted from the catalog appear here as cards.
3. Click the heart icon on any card to un-favorite a plant. It is removed from the list.
4. Click a plant card to go directly to that plant in the catalog.
5. If no favorites exist, a message prompts you to browse the catalog.

**Tips:**
- Favorites are stored in the database (`Favorite` model), not localStorage. They persist across devices and sessions.
- The heart icon on the plant catalog also reflects the favorite state for logged-in users.

---

### Flow 10: Appointments in Portal

**Narration:** Show how customers manage their bookings.

**Steps:**
1. Navigate to `/portal/appointments`.
2. All bookings (past and upcoming) are listed. Each shows: service name, date and time, meeting type, and status badge (Pending, Confirmed, Completed, Cancelled).
3. **Add to Calendar:** For any confirmed appointment, click **Add to Calendar** to download an `.ics` file.
4. **Message Maytee:** Click **Message Maytee** next to a booking to open a message form pre-linked to that booking.
5. **Cancel:** Pending or confirmed future bookings show a **Cancel** button. Clicking it shows a confirmation dialog. On confirm:
   - Booking status → cancelled
   - Calendar event deleted (if it existed)
   - Admin receives cancellation alert email
6. Past or cancelled bookings show no action buttons.

**Tips:**
- The Cancel button only appears if the booking is in `pending` or `confirmed` status and the appointment date is in the future.
- Cancellation is immediate — there is no undo from the UI. The admin can manually change the status back via the admin panel if needed.

---

### Flow 11: Messaging Maytee

**Narration:** Show the portal messaging feature.

**Steps:**
1. Navigate to `/portal/messages`.
2. A message compose form is shown. Fields: subject (optional) and message body.
3. Optionally, link the message to a specific booking using the booking selector.
4. Click **Send Message**.
5. The message is saved as an `InboxMessage` and the admin receives an email alert.
6. Previously sent messages are listed below the form.

**Tips:**
- This is one-way messaging from customer to admin. Admin replies are sent by email directly (via `/admin/inbox`).
- The page also links to `/portal/appointments` where individual booking-specific messages can be sent.

---

### Flow 12: Order History

**Narration:** Show the order history page.

**Steps:**
1. Navigate to `/portal/orders`.
2. All `StoreOrder` records linked to the logged-in user are listed. Each shows: order number, date, item summary, total, status badge.
3. Click an order to see the full order detail (same `/shop/order/[id]` confirmation page).

**Tips:**
- Orders placed as a guest (without being logged in at checkout) are not linked to the account and do not appear here.

---

### Flow 13: Account Settings

**Narration:** Show profile and preference management.

**Steps:**
1. Navigate to `/portal/settings`.
2. **Language preference:** Toggle between English and Spanish. This controls the language the site uses for plant names and descriptions.
3. **Newsletter opt-in:** Check or uncheck to opt in or out of the newsletter.
4. **Profile:** Update display name and phone number.
5. Click **Save Changes**.

**Tips:**
- Language preference is stored in the `User.languagePreference` field. The site uses it to serve `nameEn`/`nameEs` and `descriptionEn`/`descriptionEs` from the Plant model.
- Password changes are done via the forgot-password flow, not from settings.

---

---

## Admin Flows

---

### Flow 14: Admin Login

**Narration:** Log in as the business admin.

**Steps:**
1. Navigate to `/auth/login`.
2. Enter: maytee@mayteesgarden.com / Admin2024!
3. Click **Sign In**.
4. You are redirected to `/portal`. The portal sidebar shows an additional **Admin Panel** link at the top.
5. Click **Admin Panel** to go to `/admin`.

**Tips:**
- The admin panel is also accessible by going directly to `/admin` when logged in as admin/staff/superadmin.
- Staff accounts (role: `staff`) have the same admin panel access as admin.

---

### Flow 15: Admin Dashboard

**Narration:** Orient to the admin dashboard.

**Steps:**
1. Navigate to `/admin`.
2. The page shows live stats: total bookings, pending bookings, total orders, total revenue, total customers, total plants.
3. Quick-action links are shown to the most common sections.
4. The left sidebar shows all admin navigation items. The **Inbox** item shows an amber badge with the unread message count.

---

### Flow 16: Inbox

**Narration:** Show the admin unified inbox.

**Steps:**
1. Navigate to `/admin/inbox`.
2. The inbox has tabs: **All**, **Unread**, **Messages** (customer portal messages), **Booking Alerts**, **Contact Forms**, **Orders**.
3. Each message card shows: subject, sender, date, read/unread indicator.
4. **Mark as read:** Click a message card; it is marked as read automatically, and the unread badge in the sidebar updates.
5. **Inline reply:** On customer messages and contact form submissions, a reply text area appears below the message. Type a reply and click **Send Reply**. The reply is emailed to the sender.
6. Booking alert messages link to the related booking in `/admin/bookings`.
7. Order alert messages link to the related order in `/admin/orders`.

**Tips:**
- The unread badge count in the sidebar is refreshed on each page load (server-side count from DB).
- Replies to booking alerts go to the customer's email. Replies to contact forms go to the form submitter's email.

---

### Flow 17: Bookings Management

**Narration:** Walk through the booking lifecycle from admin's perspective.

**Steps:**
1. Navigate to `/admin/bookings`.
2. All bookings are listed with status filters: All, Pending, Confirmed, Completed, Cancelled.
3. Click **Pending** tab to see new unconfirmed bookings.

**Confirming a Booking:**
4. Find a pending booking. Click **Confirm**.
5. A modal appears. Select **Consultation Type** (In-Person, FaceTime, WhatsApp Video, Google Meet).
6. If video: paste the meeting link (Google Meet URL, etc.) into **Video Call Link**.
7. Optionally add internal notes in **Admin Notes** (not shown to customer).
8. Click **Confirm Booking**.
9. What happens: booking status → confirmed, calendar event created in Outlook, customer receives confirmation email.

**Editing a Confirmed Booking:**
10. Find a confirmed booking. Click **Edit Confirmation**.
11. Update the consultation type, video link, or date/time.
12. Click **Save Changes**.
13. What happens: calendar event updated, customer receives "appointment updated" email.

**Cancelling:**
14. Click **Cancel** on any booking. The status changes to cancelled and the calendar event is deleted.

**Tips:**
- The calendar event is only created if Microsoft Graph credentials are configured. Without them, booking confirmation still works — just no Outlook event.
- The booking detail shows the customer's original preference (what they requested) separately from the consultation type (what was actually confirmed).

---

### Flow 18: Availability Configuration

**Narration:** Show how to set up the booking schedule.

**Steps:**
1. Navigate to `/admin/availability`.
2. Two tabs: **Weekly Schedule** and **Blocked Dates**.

**Weekly Schedule:**
3. A 7-day grid (Sunday through Saturday) shows each day's configuration.
4. Click the toggle on a day to enable/disable it.
5. For enabled days: set Start Time, End Time, Slot Duration (minutes), and Type (In-Person / Video / Both).
6. Click **Save** for each day.
7. These templates generate the available slots customers see when booking.

**Blocked Dates:**
8. Click the **Blocked Dates** tab.
9. Click **Add Blocked Date**. A form appears with: date picker, optional reason (e.g., "Holiday", "Vacation").
10. Click **Save**. The date is added to the list of overrides.
11. To remove a blocked date, click the trash icon next to it.
12. On blocked dates, the booking calendar shows the date as unavailable (grayed out), regardless of weekly schedule.

**Tips:**
- Blocking a date does not cancel existing bookings on that date — it only prevents new ones.
- The slot type ("In-Person", "Video", "Both") on each template slot controls which meeting preferences the customer sees in the booking wizard.

---

### Flow 19: Plant Catalog Management

**Narration:** Show plant catalog administration.

**Steps:**
1. Navigate to `/admin/plants`.
2. A table lists all plants with: name, category, price, online stock, onsite stock, status.

**Inline Stock Editing:**
3. Click the online stock number for any plant. It becomes an editable field.
4. Type the new quantity and press Enter or click away to save.
5. Stock color coding: **red** = 0, **amber** = 1–3, **green** = 4+.

**Adding a Plant:**
6. Click **Add Plant**.
7. A form opens with: name autocomplete (start typing a common plant name — Wikipedia suggestions appear), description, category, price, online price (optional override), stock quantities, care level, sunlight, water requirements, tags.
8. If you select a plant from the autocomplete, the image URL is auto-populated from Wikipedia.
9. Fill in remaining fields and click **Save**.

**Editing a Plant:**
10. Click the edit icon on any plant row.
11. Update fields and click **Save**.

**Deleting a Plant:**
12. Click the delete icon. A confirmation prompt appears. On confirm, the plant is deleted.

**Tips:**
- Plant images fetched from Wikipedia/Wikimedia should use the `unoptimized` prop if displayed via `next/image`, to avoid 429 rate limiting from Wikimedia's CDN.
- `onlineStock` controls whether the plant appears as "in stock" in the shop. `onsiteStock` is informational for in-store inventory.
- The legacy `stockQty` and `inStock` fields still exist in the schema but the shop logic reads from `onlineStock`.

---

### Flow 20: Orders Management

**Narration:** Walk through fulfilling a store order.

**Steps:**
1. Navigate to `/admin/orders`.
2. Orders are listed with status filters: All, Pending, Processing, Shipped, Cancelled.
3. Click an order to see the full detail: items, customer info, shipping address, Square payment ID.

**Generate Shipping Label:**
4. On a processing order, click **Generate Label**.
5. A modal shows available Shippo rates for the order's destination and parcel weight.
6. Select a rate and click **Purchase Label**.
7. The label PDF URL and tracking number are saved to the order.

**Mark as Shipped:**
8. Once the physical package is handed to the carrier, click **Mark as Shipped**.
9. Order status → shipped.
10. Customer receives a shipping confirmation email with the tracking number.

**Cancel / Refund:**
11. Click **Cancel Order**. If a Square payment exists on the order, a refund is issued automatically via the Square Refund API.
12. Order status → cancelled.

**Tips:**
- Shippo label purchase is final — you are charged for the label even if you don't use it.
- The tracking number from the label is stored in `StoreOrder.trackingNumber` and included in the shipping email.

---

### Flow 21: Customers (User List)

**Narration:** Show the customer list.

**Steps:**
1. Navigate to `/admin/users`.
2. A table lists all customers: name, email, phone, created date, newsletter status, role.
3. This is a read-only view. To edit users or change roles, use the Super Admin panel.

---

### Flow 22: Leads Management

**Narration:** Show contact form handling and newsletter management.

**Steps:**
1. Navigate to `/admin/leads`.
2. Two tabs: **Contact Forms** and **Newsletter**.

**Contact Forms:**
3. All `ContactSubmission` records are listed: name, email, service interest, message preview, status (New, Read, Replied, Archived).
4. Click a submission to expand it and see the full message.
5. Type a reply in the reply box and click **Send Reply**. The reply is emailed to the submitter. Status changes to "Replied".

**Newsletter:**
6. Shows total confirmed subscriber count.
7. Click **Send Newsletter**.
8. A compose modal opens with: subject line, and a rich text body field.
9. Fill in and click **Send**. The newsletter is sent to all confirmed (`confirmed = true`) subscribers.
10. Each email includes a personalized unsubscribe link.

**Tips:**
- Newsletter sends are not queued — they fire synchronously one-by-one. For large lists, this may need to be refactored to a background job.
- To remove a specific subscriber, use Prisma Studio (`npm run db:studio`) or a direct DB query — the UI does not support individual removal yet.

---

### Flow 23: Audit Logs

**Narration:** Show the audit trail.

**Steps:**
1. Navigate to `/admin/logs`.
2. A paginated table shows all `AuditLog` entries: timestamp, user, action, entity type, entity ID, details.
3. Logs are written automatically when admin actions occur (booking confirmation, plant edits, order updates, etc.).

---

### Flow 24: Test Email (Hidden)

**Narration:** Verify the email pipeline is working.

**Steps:**
1. Navigate directly to `/admin/test-email` (not shown in sidebar nav).
2. Click **Send Test Email**. A test email is sent to `ADMIN_EMAIL`.
3. Check the inbox for the test message.
4. If no email arrives: check that `RESEND_API_KEY` is set in environment variables, and that the from address is on a verified Resend domain.

---

---

## Super Admin Flows

---

### Flow 25: Super Admin Login

**Narration:** Log in with super admin credentials.

**Steps:**
1. Navigate to `/auth/login`.
2. Enter: maytee@mayteesgardencenter.com / Maytee@Admin2026
3. Click **Sign In**.
4. You are redirected to `/portal`. Note: the super admin lands at the portal first, not `/superadmin` directly.
5. Navigate to `/superadmin` manually (or the portal sidebar shows a super admin link).
6. The super admin panel has a **dark theme** — gray-950 background — clearly distinguished from the green business admin panel.
7. The sidebar shows: Dashboard, User Management, Website Settings.

**Tips:**
- The superadmin can also access `/admin` (the business admin panel) by clicking "Business Admin" in the super admin sidebar footer.
- Only accounts with `role: "superadmin"` can access `/superadmin/*`. Admin accounts are blocked.

---

### Flow 26: User Management

**Narration:** Show full user management capabilities.

**Steps:**
1. Navigate to `/superadmin/users`.
2. A table lists all users: name, email, role badge, phone, created date.
3. Role badges are color-coded: **amber** = Superadmin, **green** = Admin, **blue** = Staff, **gray** = Customer.

**Create a New User:**
4. Click **New User**.
5. Fill in: name, email, temporary password, role, phone (optional).
6. Click **Create User**. The user is created immediately and can log in.

**Edit a User:**
7. Click the edit icon on any user row.
8. Update name, role, or phone. Click **Save**.
9. Role changes take effect on the user's next session (JWT sessions are not invalidated immediately).

**Reset Password:**
10. Click **Reset Password** on a user row.
11. Enter a new temporary password. Click **Save**.
12. The user's `passwordHash` is updated. Communicate the temporary password to the user out of band.

**Delete a User:**
13. Click the delete icon. A confirmation prompt appears.
14. On confirm, the user is deleted. Associated bookings and orders are orphaned (userId set to null).

---

### Flow 27: Role Changes and Password Resets

**Narration:** Specific scenarios for role management.

**Promoting a customer to admin:**
1. In `/superadmin/users`, find the customer account.
2. Click edit. Change role from "customer" to "admin". Click Save.
3. The user will see the Admin Panel link after their next login (JWT refresh).

**Resetting a forgotten admin password:**
1. Find the admin user in `/superadmin/users`.
2. Click **Reset Password**. Enter a new temporary password.
3. Share the temporary password securely with the user.
4. Advise them to change it via the forgot-password flow after logging in.

---

### Flow 28: Website Settings

**Narration:** Show the settings page.

**Steps:**
1. Navigate to `/superadmin/settings`.
2. The page shows site configuration fields: business name, address, phone, email, business hours.
3. **Currently read-only** — fields are displayed but not editable via UI.
4. This page is a placeholder for future editable site configuration.

**Tips:**
- All site config is currently hard-coded in components and email templates. Phase 2 will make this editable and pull from a DB settings table.
