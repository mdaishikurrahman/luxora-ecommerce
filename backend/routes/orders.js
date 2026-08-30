const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth, requireAdmin, optionalAuth } = require("../middleware/auth");

const router = express.Router();

const DELIVERY_PRICES = { standard: 15, express: 30, free: 0 };

function generateOrderNumber() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `LX${rand}`;
}

/* =========================================================
   PUBLIC — place an order (used by checkout.html)
========================================================= */

router.post(
    "/",
    optionalAuth,
    [
        body("customer.firstName").trim().notEmpty().withMessage("First name is required."),
        body("customer.lastName").trim().notEmpty().withMessage("Last name is required."),
        body("customer.email").isEmail().withMessage("Valid email is required."),
        body("customer.phone").trim().notEmpty().withMessage("Phone is required."),
        body("shippingAddress.address").trim().notEmpty().withMessage("Address is required."),
        body("shippingAddress.city").trim().notEmpty().withMessage("City is required."),
        body("shippingAddress.state").trim().notEmpty().withMessage("State is required."),
        body("shippingAddress.zip").trim().notEmpty().withMessage("ZIP code is required."),
        body("shippingAddress.country").trim().notEmpty().withMessage("Country is required."),
        body("items").isArray({ min: 1 }).withMessage("Cart is empty."),
        body("payment.method").isIn(["card", "paypal", "cash"]).withMessage("Invalid payment method."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { items, delivery = {}, couponCode = "", customer, shippingAddress, payment, notes = "" } = req.body;

            const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
            const deliveryMethod = delivery.method || "standard";
            const shippingCost = DELIVERY_PRICES[deliveryMethod] ?? 15;

            // Discount is recalculated server-side against the Coupon collection
            // (see routes/coupons.js) rather than trusting a client-sent number.
            let discount = 0;
            if (couponCode) {
                const Coupon = require("../models/Coupon");
                const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
                if (coupon) discount = Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100;
            }

            const total = Math.max(0, subtotal + shippingCost - discount);

            // For card payments, verify the actual Stripe PaymentIntent server-side
            // rather than trusting the frontend's word that payment succeeded.
            let paymentStatus = payment.method === "cash" ? "pending" : "paid";
            let verifiedIntentId = "";

            if (payment.method === "card") {
                const { getStripe } = require("../config/stripe");
                const stripe = getStripe();
                const intentId = payment.stripePaymentIntentId;

                if (!stripe || !intentId) {
                    return res.status(400).json({ message: "Missing or unconfigured card payment. Please try again." });
                }

                const intent = await stripe.paymentIntents.retrieve(intentId);

                if (intent.status !== "succeeded") {
                    return res.status(402).json({ message: "Payment was not completed. Please try again." });
                }

                // Guard against a tampered/mismatched amount — the charged amount
                // (in cents) must match what this order actually totals to.
                const expectedCents = Math.round(total * 100);
                if (intent.amount !== expectedCents) {
                    return res.status(402).json({ message: "Payment amount does not match order total." });
                }

                paymentStatus = "paid";
                verifiedIntentId = intent.id;
            }

            let orderNumber = generateOrderNumber();
            while (await Order.findOne({ orderNumber })) {
                orderNumber = generateOrderNumber();
            }

            const order = await Order.create({
                orderNumber,
                user: req.user ? req.user._id : null,
                customer,
                shippingAddress,
                items,
                delivery: { method: deliveryMethod, price: shippingCost },
                payment: {
                    method: payment.method,
                    status: paymentStatus,
                    stripePaymentIntentId: verifiedIntentId,
                },
                couponCode: couponCode || "",
                subtotal,
                discount,
                shipping: shippingCost,
                total,
                notes,
            });

            // Decrease stock for each purchased item (best-effort; ignores products not found)
            await Promise.all(
                items.map((item) =>
                    item.product
                        ? Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
                        : Promise.resolve()
                )
            );

            res.status(201).json({ order });
        } catch (err) {
            res.status(500).json({ message: "Could not place order.", error: err.message });
        }
    }
);

// GET /api/orders/:orderNumber — order lookup (for a confirmation page)
router.get("/:orderNumber", async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json({ order });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch order.", error: err.message });
    }
});

// GET /api/orders/me/history — logged-in customer's own orders
router.get("/me/history", requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ items: orders });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch your orders.", error: err.message });
    }
});

/* =========================================================
   ADMIN — view all orders, update status
========================================================= */

router.get("/", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const pageNum = Math.max(1, Number(page));
        const perPage = Math.min(100, Math.max(1, Number(limit)));

        const [items, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * perPage)
                .limit(perPage),
            Order.countDocuments(filter),
        ]);

        res.json({ items, total, page: pageNum, pages: Math.ceil(total / perPage) });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch orders.", error: err.message });
    }
});

router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json({ order });
    } catch (err) {
        res.status(500).json({ message: "Could not update order.", error: err.message });
    }
});

module.exports = router;
