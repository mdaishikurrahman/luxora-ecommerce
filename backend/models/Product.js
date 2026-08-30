const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

        category: { type: String, required: true, trim: true }, // men | women | accessories | lifestyle ...
        categoryLabel: { type: String, trim: true },             // display text e.g. "MEN / CLOTHING"

        price: { type: Number, required: true, min: 0 },
        compareAtPrice: { type: Number, min: 0, default: null }, // original price if on sale

        description: { type: String, default: "" },
        shortDescription: { type: String, default: "" },

        images: { type: [String], default: [] },
        colors: {
            type: [
                {
                    name: { type: String, required: true },
                    hex: { type: String, required: true },
                },
            ],
            default: [],
        },
        sizes: { type: [String], default: [] },

        stock: { type: Number, required: true, min: 0, default: 0 },

        rating: { type: Number, min: 0, max: 5, default: 0 },
        reviewCount: { type: Number, min: 0, default: 0 },

        badge: { type: String, enum: ["", "New", "Sale", "Best Seller"], default: "" },
        featured: { type: Boolean, default: false },
        active: { type: Boolean, default: true }, // soft-hide instead of deleting

        details: {
            type: [{ label: String, value: String }],
            default: [],
        },
    },
    { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
