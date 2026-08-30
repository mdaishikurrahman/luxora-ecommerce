const express = require("express");
const { getStripe } = require("../config/stripe");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/payments/status — lets the frontend check if card payment is even available
router.get("/status", (req, res) => {
    res.json({ available: !!getStripe() });
});

// POST /api/payments/create-intent
// Body: { amount: number (in dollars), currency?: string }
// Returns a Stripe PaymentIntent client_secret for Stripe.js to confirm on the frontend.
// The amount is NOT trusted blindly forever — the /api/orders route re-verifies the
// PaymentIntent's actual charged amount against the order total before marking it paid.
router.post("/create-intent", optionalAuth, async (req, res) => {
    const stripe = getStripe();

    if (!stripe) {
        return res.status(503).json({
            message: "Card payments are not configured on the server yet (STRIPE_SECRET_KEY missing).",
        });
    }

    const { amount, currency = "usd" } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "A valid amount is required." });
    }

    try {
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses the smallest currency unit (cents)
            currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: req.user ? String(req.user._id) : "guest",
            },
        });

        res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
    } catch (err) {
        res.status(500).json({ message: "Could not start payment.", error: err.message });
    }
});

module.exports = router;
