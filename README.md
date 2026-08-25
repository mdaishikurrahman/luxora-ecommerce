# LUXORA — Premium Fashion & Lifestyle E-commerce Website

LUXORA is a front-end e-commerce storefront concept for a premium fashion and lifestyle brand — built with static HTML, Tailwind CSS, and vanilla JavaScript.

**Live pages:** Home · Shop · Product Details · Cart · Checkout · About · Contact

## ✨ Features

- Fully responsive, modern UI (Tailwind CSS + Google Fonts + Font Awesome)
- Product listing with filters, search, and price range (`shop.html`)
- Product detail page (`product.html`)
- Shopping cart with coupon code support (`cart.html`)
- Checkout flow with shipping & payment form (`checkout.html`)
- About & Contact pages with working contact form UI
- Optional backend integration layer (`js/api-config.js`) — the storefront works fully offline/local, and can optionally connect to a REST API backend

## 📁 Project Structure

```
Premium E-commerce website/
├── index.html          # Homepage
├── shop.html           # Product listing
├── product.html        # Product details
├── cart.html           # Shopping cart
├── checkout.html       # Checkout
├── about.html          # About page
├── contact.html        # Contact page
├── images/              # Product, category & banner images
└── js/
    ├── main.js          # Homepage logic
    ├── shop.js          # Shop/listing logic
    ├── product.js        # Product page logic
    ├── cart.js           # Cart logic
    ├── checkout.js        # Checkout logic
    ├── contact.js        # Contact form logic
    ├── about.js          # About page logic
    └── api-config.js      # Shared API helper (backend integration)
```

## 🚀 Getting Started

No build step required — this is a static site.

1. Clone the repo:
   ```bash
   git clone <your-repo-url>
   cd "Premium E-commerce website"
   ```
2. Open `index.html` directly in your browser, or serve it locally:
   ```bash
   npx serve .
   # or
   python3 -m http.server 5500
   ```
3. Visit `http://localhost:5500` (or the port shown).

## 🔌 Connecting a Backend (optional)

The storefront can optionally talk to a REST API for live product/cart/checkout data. By default it looks for the API at `http://localhost:4000/api`.

To point it at your own backend, add this **before** the other scripts load (e.g. in an inline `<script>` tag in the `<head>`):

```html
<script>
  window.LUXORA_API_URL = "https://api.yoursite.com/api";
</script>
```

If no backend is available, the site falls back to local/offline behavior automatically.

## 🛠️ Tech Stack

- HTML5
- Tailwind CSS (via CDN — for production, set up a proper Tailwind build with `npm install -D tailwindcss` and a `tailwind.config.js`)
- Vanilla JavaScript
- Font Awesome & Google Fonts (Playfair Display, DM Sans)

## 📌 Notes

- This project currently uses the Tailwind **Play CDN**, which is intended for development/prototyping. For a production deployment, compile Tailwind via a build step to reduce load time and enable purging unused styles.
- Some images in `images/` are large; consider compressing them (e.g. with `squoosh` or `imagemin`) before deploying to production.

## 📄 License

This project is available for personal/portfolio use. Update this section with your preferred license before publishing publicly.
