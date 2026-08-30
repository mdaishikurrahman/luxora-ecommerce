const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        role: { type: String, enum: ["customer", "admin"], default: "customer" },

        phone: { type: String, default: "" },
        addresses: {
            type: [
                {
                    label: String,
                    address: String,
                    apartment: String,
                    city: String,
                    state: String,
                    zip: String,
                    country: String,
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
