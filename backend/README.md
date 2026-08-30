# LUXORA Backend — API + Admin Panel

A Node.js/Express + MongoDB backend for the LUXORA storefront: product
catalog, orders/checkout, coupons, and a full admin panel to manage
products and orders.

## 1. Requirements

- Node.js 18+
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`)
  - **Cloud (easiest)**: create a free cluster at https://www.mongodb.com/cloud/atlas
    and copy its connection string

## 2. Setup

```bash
cd luxora-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string (used to sign login tokens)
- `CORS_ORIGINS` — where your frontend will be served from, e.g.
  `http://127.0.0.1:5500` if you open the storefront with VS Code's
  Live Server, or `http://localhost:3000` for another dev server
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the admin login the seed script
  will create

## 3. Seed the database

```bash
npm run seed
```

This creates:
- one admin account (from `.env`)
- the 12 demo products already shown on `shop.html`
- 3 demo coupons: `LUXORA10` (10%), `WELCOME15` (15%), `VIP20` (20%)

Safe to re-run — it skips anything that already exists.

## 4. Run the server

```bash
npm start          # production
npm run dev         # auto-restarts on file changes (nodemon)
```

You should see:

```
LUXORA API running on http://localhost:4000
Admin panel:        http://localhost:4000/admin
```

## 5. Log into the admin panel

Go to **http://localhost:4000/admin/login.html** and sign in with the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`. From there you can:

- **Dashboard** — revenue, order count, low-stock warnings
- **Products** — add, edit, hide/delete products
- **Orders** — view order details, update status (pending → processing
  → shipped → delivered)
- **Coupons** — create/disable discount codes

## 6. API overview

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | Customer signup |
| POST | `/auth/login` | — | Login (customer or admin) |
| GET | `/auth/me` | token | Current user |
| GET | `/products` | — | Browse/filter/sort products |
| GET | `/products/:slug` | — | Single product |
| POST | `/products` | admin | Create product |
| PUT | `/products/:id` | admin | Update product |
| DELETE | `/products/:id` | admin | Hide product (soft delete) |
| GET | `/products/admin/all` | admin | All products incl. hidden |
| POST | `/orders` | optional | Place an order (guest or logged in) |
| GET | `/orders/:orderNumber` | — | Look up one order |
| GET | `/orders` | admin | List all orders |
| PUT | `/orders/:id/status` | admin | Update order status |
| POST | `/coupons/validate` | — | Check a coupon code |
| GET/POST/PUT/DELETE | `/coupons` | admin | Manage coupons |
| GET | `/dashboard/summary` | admin | Admin dashboard numbers |
| POST | `/contact` | — | Submit the contact form (sends email + saves to DB) |
| GET | `/contact` | admin | List contact messages (admin inbox) |
| PUT | `/contact/:id/read` | admin | Mark a message as read |
| GET | `/payments/status` | — | Whether Stripe is configured |
| POST | `/payments/create-intent` | optional | Start a Stripe payment |
| GET | `/orders/me/history` | customer | Logged-in customer's own orders |

Admin-only routes require an `Authorization: Bearer <token>` header —
the token comes back from `/auth/login`.

## 7. Connecting the LUXORA frontend to this API

Right now `shop.html`, `product.html`, `cart.html`, and `checkout.html`
still use their own hardcoded product lists and `localStorage` cart —
that part of the frontend hasn't been rewired to call this API yet.

To go fully dynamic, the general pattern in each page's JS file is:

```js
// Example: fetch real products instead of using the hardcoded array
const API_BASE = "http://localhost:4000/api";

async function loadProducts() {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    return data.items; // render these into .shop-product-grid
}
```

```js
// Example: submit the real checkout instead of just showing the modal
async function placeOrder(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return (await res.json()).order;
}
```

If you'd like, this rewiring (shop.js, product.js, cart.js, checkout.js
all reading/writing through this API instead of static data) can be
done as a follow-up — just ask.

## 8. Card payments (Stripe)

Checkout accepts real card payments via [Stripe](https://stripe.com).
Card details never touch this server or its own code — Stripe.js
mounts a secure iframe directly in the browser.

**Setup:**

1. Create a free Stripe account, switch to **Test mode**.
2. Get your test keys from https://dashboard.stripe.com/test/apikeys.
3. In the backend's `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. In the frontend, open `js/api-config.js` and replace the
   placeholder:
   ```js
   const LUXORA_STRIPE_PUBLISHABLE_KEY = "pk_test_...";
   ```
   (The publishable key is safe to expose in frontend code — it is
   not the secret key.)

**Test card number:** `4242 4242 4242 4242`, any future expiry, any
3-digit CVC, any ZIP.

If Stripe isn't configured, the card option shows a friendly notice
and customers can still check out with **Cash on Delivery** — nothing
breaks.

**How it's verified:** the frontend confirms payment with Stripe,
then sends the order to `/api/orders` along with the Stripe
PaymentIntent ID. The backend re-fetches that PaymentIntent directly
from Stripe and checks its status **and** amount before marking the
order as paid — the frontend's word alone is never trusted.

## 9. Customer accounts

Customers can create accounts, log in, and view their order history
— separate from the admin login.

- `frontend/login.html` / `frontend/register.html` — sign in / sign up
- `frontend/account.html` — order history (calls `GET /api/orders/me/history`)
- Reuses the same `User` model and `/api/auth/*` routes as the admin
  login; the only difference is `role: "customer"` vs `role: "admin"`
- At checkout, a logged-in customer's name/email pre-fill
  automatically, and their orders get linked to their account
  (`order.user`) instead of being anonymous guest orders

No setup needed — this works as soon as MongoDB is connected.

## 10. Contact form email

The contact form (`/api/contact`) sends an email via SMTP using
[Nodemailer](https://nodemailer.com). Every submission is saved to the
database regardless of whether email sending succeeds, so nothing is
lost — you can always check **Admin → Messages**.

To enable actual email delivery, fill in `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_RECEIVER_EMAIL=hello@luxora.com
MAIL_FROM="LUXORA Website <your-email@gmail.com>"
```

**Using Gmail:** you can't use your normal Gmail password — generate a
16-character **App Password** at
https://myaccount.google.com/apppasswords (requires 2-Step
Verification to be turned on first).

**Using another provider** (SendGrid, Mailgun, Outlook, your own
mail server, etc.): just point `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`
at their SMTP credentials — the code doesn't need to change.

If SMTP isn't configured, the form still works: the message is saved
to the database and the visitor sees a success message, but no email
goes out. The admin inbox will show it as "Not sent".

## 11. Notes

- Product images referenced by `images: ["images/products/..."]` are
  paths into the **storefront's** `images/` folder, not this backend —
  the admin panel just stores the path/URL string. To let admins
  upload image files directly, `multer` is already installed as a
  dependency; ask if you'd like an upload endpoint wired in.
- Stock is decremented automatically when an order is placed.
- Discounts are always recalculated server-side from the `Coupon`
  collection at checkout — the frontend's discount number is never
  trusted directly.
