const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true },

        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = guest checkout

        customer: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },

        shippingAddress: {
            address: { type: String, required: true },
            apartment: { type: String, default: "" },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
        },

        items: { type: [orderItemSchema], required: true },

        delivery: {
            method: { type: String, enum: ["standard", "express", "free"], default: "standard" },
            price: { type: Number, default: 0 },
        },

        payment: {
            method: { type: String, enum: ["card", "paypal", "cash"], required: true },
            status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
            stripePaymentIntentId: { type: String, default: "" },
        },

        couponCode: { type: String, default: "" },
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
        total: { type: Number, required: true },

        notes: { type: String, default: "" },

        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
