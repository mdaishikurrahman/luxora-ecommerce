# LUXORA — Premium E-commerce Site

A full-stack e-commerce demo: a Tailwind CSS storefront (`/frontend`)
backed by a Node.js/Express + MongoDB API and admin panel (`/backend`).

## Structure

```
luxora/
├── frontend/     Static storefront — HTML + Tailwind CSS + vanilla JS
│                 (index, shop, product, cart, checkout, about, contact)
└── backend/      Express API + MongoDB models + admin dashboard
                  (products, orders, users, coupons)
```

## Quick start

### 1. Backend (API + admin panel)

```bash
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc.
npm run seed               # creates demo products, coupons, admin login
npm start                  # http://localhost:4000
```

Admin panel: **http://localhost:4000/admin/login.html**
(login with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`)

Full details: [`backend/README.md`](backend/README.md)

### 2. Frontend (storefront)

The frontend is plain static files — no build step. Serve the
`frontend/` folder with any static server, e.g.:

```bash
cd frontend
npx serve .
# or open index.html with VS Code's Live Server extension
```

By default the frontend calls the API at `http://localhost:4000/api`
(see `frontend/js/api-config.js`). Update `CORS_ORIGINS` in the
backend's `.env` to match whatever URL you serve the frontend from.

If the backend isn't running, the storefront still works using its
built-in static product list and `localStorage` cart — the API
connection is a progressive enhancement, not a hard requirement.

## Tech

- **Frontend**: HTML, Tailwind CSS (CDN), vanilla JavaScript
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Admin panel**: static HTML/JS calling the same API

## License

Personal/portfolio project — add a license here if you plan to open-source it.
