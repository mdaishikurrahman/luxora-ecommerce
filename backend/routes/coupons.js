const express = require("express");
const Coupon = require("../models/Coupon");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/coupons/validate — used by cart.html / checkout.html
router.post("/validate", async (req, res) => {
    try {
        const code = (req.body.code || "").toUpperCase().trim();
        const coupon = await Coupon.findOne({ code, active: true });

        if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
            return res.status(404).json({ valid: false, message: "Invalid coupon code." });
        }

        res.json({ valid: true, discountPercent: coupon.discountPercent });
    } catch (err) {
        res.status(500).json({ message: "Could not validate coupon.", error: err.message });
    }
});

// Admin CRUD
router.get("/", requireAuth, requireAdmin, async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ items: coupons });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ coupon });
    } catch (err) {
        res.status(400).json({ message: "Could not create coupon.", error: err.message });
    }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json({ coupon });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json({ message: "Coupon deleted." });
});

module.exports = router;
