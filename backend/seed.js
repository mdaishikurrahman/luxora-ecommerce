/**
 * Seeds the database with:
 *  - one admin account (from .env ADMIN_EMAIL / ADMIN_PASSWORD)
 *  - the 12 demo products already used on shop.html
 *  - the 3 demo coupons already referenced in checkout.js
 *
 * Safe to re-run — skips anything that already exists.
 * Usage: npm run seed
 */
require("dotenv").config();
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");
const Coupon = require("./models/Coupon");

const products = [
    { name: "Premium Silk Shirt", category: "men", categoryLabel: "MEN / CLOTHING", price: 129, images: ["images/products/07-silk-shirt.jpg"], rating: 5, reviewCount: 24, stock: 40 },
    { name: "Luxury Leather Handbag", category: "women", categoryLabel: "WOMEN / BAGS", price: 189, compareAtPrice: 236, badge: "Sale", images: ["images/products/02-leather-handbag.jpg"], rating: 5, reviewCount: 31, stock: 25 },
    { name: "LUXORA Noir Perfume", category: "accessories", categoryLabel: "BEAUTY / FRAGRANCE", price: 149, images: ["images/products/03-premium-perfume.jpg"], rating: 4, reviewCount: 18, stock: 60 },
    { name: "Signature Sunglasses", category: "lifestyle", categoryLabel: "ACCESSORIES / EYEWEAR", price: 79, images: ["images/products/04-sunglasses.jpg"], rating: 5, reviewCount: 42, stock: 80 },
    { name: "Classic Leather Wallet", category: "men", categoryLabel: "ACCESSORIES / LEATHER", price: 219, images: ["images/products/05-leather-wallet.jpg"], rating: 5, reviewCount: 21, stock: 30 },
    { name: "Luxury Dress Shoes", category: "women", categoryLabel: "MEN / FOOTWEAR", price: 159, images: ["images/products/06-luxury-shoes.jpg"], rating: 4, reviewCount: 29, stock: 35 },
    { name: "Premium Gold Jewelry", category: "accessories", categoryLabel: "JEWELRY / NECKLACES", price: 99, images: ["images/products/08-premium-jewelry.jpg"], rating: 4, reviewCount: 13, stock: 50 },
    { name: "LUXORA Luxury Headphones", category: "lifestyle", categoryLabel: "TECH / AUDIO", price: 119, images: ["images/products/09-luxury-headphones.jpg"], rating: 5, reviewCount: 36, stock: 45 },
    { name: "Premium Travel Bag", category: "men", categoryLabel: "TRAVEL / BAGS", price: 179, images: ["images/products/10-travel-bag.jpg"], rating: 4, reviewCount: 21, stock: 20 },
    { name: "LUXORA Luxury Watch", category: "women", categoryLabel: "ACCESSORIES / WATCHES", price: 199, images: ["images/products/01-luxury-watch.jpg"], rating: 5, reviewCount: 29, stock: 15 },
    { name: "Classic Chronograph", category: "accessories", categoryLabel: "ACCESSORIES / WATCHES", price: 129, images: ["images/products/product-11.jpg"], rating: 5, reviewCount: 33, stock: 22 },
    { name: "Artisan Coffee Collection", category: "lifestyle", categoryLabel: "LIFESTYLE / DINING", price: 89, images: ["images/products/product-12.jpg"], rating: 4, reviewCount: 19, stock: 55 },

    // --- page 2 additions ---
    { name: "Classic Linen Shirt", category: "men", categoryLabel: "MEN / CLOTHING", price: 109, images: ["images/featured/Classic Linen Shirt.jpg"], rating: 5, reviewCount: 27, stock: 38 },
    { name: "Minimalist Watch", category: "women", categoryLabel: "ACCESSORIES / WATCHES", price: 175, images: ["images/featured/Minimalist Watch.jpg"], rating: 5, reviewCount: 22, stock: 18 },
    { name: "Premium Leather Bag", category: "women", categoryLabel: "WOMEN / BAGS", price: 215, images: ["images/featured/Premium Leather Bag.jpg"], rating: 5, reviewCount: 34, stock: 20 },
    { name: "Signature Sneakers", category: "lifestyle", categoryLabel: "MEN / FOOTWEAR", price: 139, images: ["images/featured/Signature Sneakers.jpg"], rating: 4, reviewCount: 41, stock: 46 },
    { name: "Classic Aviator Sunglasses", category: "accessories", categoryLabel: "ACCESSORIES / EYEWEAR", price: 95, images: ["images/new-arrivals/Classic Sunglasses.png"], rating: 4, reviewCount: 16, stock: 60 },
    { name: "Luxury Leather Loafers", category: "men", categoryLabel: "MEN / FOOTWEAR", price: 189, images: ["images/new-arrivals/Luxury Leather Loafers.png"], rating: 5, reviewCount: 25, stock: 28 },
    { name: "Premium Overshirt", category: "men", categoryLabel: "MEN / CLOTHING", price: 149, images: ["images/new-arrivals/Premium Overshirt.png"], rating: 4, reviewCount: 12, stock: 33 },
    { name: "Silk Evening Dress", category: "women", categoryLabel: "WOMEN / CLOTHING", price: 259, compareAtPrice: 299, badge: "Sale", images: ["images/new-arrivals/Silk Evening Dress.png"], rating: 5, reviewCount: 30, stock: 14 },
    { name: "Rose Gold Wristwatch", category: "women", categoryLabel: "ACCESSORIES / WATCHES", price: 229, images: ["images/products/11-rose-gold-wristwatch.png"], rating: 5, reviewCount: 19, stock: 16 },
    { name: "Structured Tote Bag", category: "women", categoryLabel: "WOMEN / BAGS", price: 165, images: ["images/products/13-structured-tote-bag.png"], rating: 4, reviewCount: 23, stock: 24 },
    { name: "Aviator Sunglasses", category: "accessories", categoryLabel: "ACCESSORIES / EYEWEAR", price: 69, images: ["images/products/12-aviator-sunglasses.png"], rating: 4, reviewCount: 20, stock: 50 },
    { name: "Leather Card Holder", category: "men", categoryLabel: "ACCESSORIES / LEATHER", price: 79, images: ["images/categories/accessories.jpg"], rating: 5, reviewCount: 17, stock: 42 },
];

const coupons = [
    { code: "LUXORA10", discountPercent: 10 },
    { code: "WELCOME15", discountPercent: 15 },
    { code: "VIP20", discountPercent: 20 },
];

function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

async function run() {
    await connectDB();

    // Admin account
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@luxora.com").toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
        await User.create({
            name: "LUXORA Admin",
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
            role: "admin",
        });
        console.log(`Created admin account: ${adminEmail}`);
    } else {
        console.log(`Admin account already exists: ${adminEmail}`);
    }

    // Products
    let created = 0;
    for (const p of products) {
        const slug = slugify(p.name);
        const exists = await Product.findOne({ slug });
        if (!exists) {
            await Product.create({ ...p, slug });
            created++;
        }
    }
    console.log(`Products: ${created} created, ${products.length - created} already existed.`);

    // Coupons
    let couponsCreated = 0;
    for (const c of coupons) {
        const exists = await Coupon.findOne({ code: c.code });
        if (!exists) {
            await Coupon.create(c);
            couponsCreated++;
        }
    }
    console.log(`Coupons: ${couponsCreated} created, ${coupons.length - couponsCreated} already existed.`);

    console.log("\nSeed complete.");
    process.exit(0);
}

run().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
