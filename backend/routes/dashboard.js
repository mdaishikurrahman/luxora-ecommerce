const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard/summary — headline numbers for the admin home page
router.get("/summary", requireAuth, requireAdmin, async (req, res) => {
    try {
        const [productCount, orderCount, userCount, orders] = await Promise.all([
            Product.countDocuments({ active: true }),
            Order.countDocuments({}),
            User.countDocuments({ role: "customer" }),
            Order.find({}).select("total status createdAt").sort({ createdAt: -1 }).limit(5),
        ]);

        const revenueAgg = await Order.aggregate([
            { $match: { "payment.status": "paid" } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]);

        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const lowStock = await Product.countDocuments({ active: true, stock: { $lte: 5 } });

        res.json({
            productCount,
            orderCount,
            userCount,
            pendingOrders,
            lowStock,
            revenue: revenueAgg[0]?.total || 0,
            recentOrders: orders,
        });
    } catch (err) {
        res.status(500).json({ message: "Could not load dashboard.", error: err.message });
    }
});

module.exports = router;
