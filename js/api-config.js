/* =========================================================
   LUXORA — shared API config
   Include this BEFORE shop.js / product.js / cart.js / checkout.js
========================================================= */

// Change this if your backend runs somewhere other than localhost:4000
// (e.g. set window.LUXORA_API_URL = "https://api.yoursite.com/api" in
// a small inline <script> before this file loads).
const LUXORA_API_BASE = window.LUXORA_API_URL || "http://localhost:4000/api";

// Stripe's PUBLISHABLE key (safe to expose in frontend code — this is
// not the secret key). Get it from https://dashboard.stripe.com/test/apikeys
// and replace the placeholder below, or set window.LUXORA_STRIPE_KEY
// before this file loads.
const LUXORA_STRIPE_PUBLISHABLE_KEY = window.LUXORA_STRIPE_KEY || "pk_test_YOUR_PUBLISHABLE_KEY";

/**
 * Fetch wrapper for the LUXORA API. Throws on non-2xx responses with
 * the server's error message. Callers should wrap calls in try/catch
 * and fall back to existing local/offline behavior on failure — the
 * storefront should still work if the backend isn't running.
 */
async function luxoraApiFetch(path, options = {}) {
    const res = await fetch(`${LUXORA_API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data;
}
