const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, default: "" },
        subject: { type: String, default: "" },
        message: { type: String, required: true },

        emailSent: { type: Boolean, default: false },
        emailError: { type: String, default: "" },

        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
