const Stripe = require("stripe");

let cachedClient = null;

/**
 * Returns a configured Stripe client, or null if STRIPE_SECRET_KEY
 * isn't set. Callers should handle the null case gracefully — card
 * payments simply aren't available until Stripe is configured.
 */
function getStripe() {
    if (cachedClient) return cachedClient;

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith("sk_test_...")) return null;

    cachedClient = new Stripe(key);
    return cachedClient;
}

module.exports = { getStripe };
