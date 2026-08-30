const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

/* =========================================================
   PUBLIC — browsing (used by shop.html / product.html)
========================================================= */

// GET /api/products?category=men&minPrice=0&maxPrice=500&sort=price-low&search=watch&page=1&limit=12
router.get("/", async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, search, page = 1, limit = 12, featured } = req.query;

        const filter = { active: true };
        if (category && category !== "all") filter.category = category;
        if (featured === "true") filter.featured = true;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) filter.$text = { $search: search };

        const sortMap = {
            "price-low": { price: 1 },
            "price-high": { price: -1 },
            newest: { createdAt: -1 },
            rating: { rating: -1 },
            featured: { featured: -1, createdAt: -1 },
        };
        const sortBy = sortMap[sort] || { createdAt: -1 };

        const pageNum = Math.max(1, Number(page));
        const perPage = Math.min(60, Math.max(1, Number(limit)));

        const [items, total] = await Promise.all([
            Product.find(filter)
                .sort(sortBy)
                .skip((pageNum - 1) * perPage)
                .limit(perPage),
            Product.countDocuments(filter),
        ]);

        res.json({
            items,
            total,
            page: pageNum,
            pages: Math.ceil(total / perPage),
        });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch products.", error: err.message });
    }
});

// GET /api/products/:slug — single product by slug (for product.html)
router.get("/:slug", async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, active: true });
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json({ product });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch product.", error: err.message });
    }
});

/* =========================================================
   ADMIN — create / update / delete (requires admin login)
========================================================= */

const validateProduct = [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
];

// POST /api/products — create (admin only)
router.post("/", requireAuth, requireAdmin, validateProduct, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const slugBase = slugify(req.body.slug || req.body.name);
        let slug = slugBase;
        let n = 1;
        while (await Product.findOne({ slug })) {
            slug = `${slugBase}-${n++}`;
        }

        const product = await Product.create({ ...req.body, slug });
        res.status(201).json({ product });
    } catch (err) {
        res.status(500).json({ message: "Could not create product.", error: err.message });
    }
});

// PUT /api/products/:id — update (admin only)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const update = { ...req.body };
        delete update.slug; // slug stays stable after creation

        const product = await Product.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json({ product });
    } catch (err) {
        res.status(500).json({ message: "Could not update product.", error: err.message });
    }
});

// DELETE /api/products/:id — soft delete (admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product removed.", product });
    } catch (err) {
        res.status(500).json({ message: "Could not delete product.", error: err.message });
    }
});

// GET /api/products/admin/all — admin listing, includes inactive products
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({ items: products, total: products.length });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch products.", error: err.message });
    }
});

module.exports = router;
