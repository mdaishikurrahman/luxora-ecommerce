require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const couponRoutes = require("./routes/coupons");
const dashboardRoutes = require("./routes/dashboard");
const contactRoutes = require("./routes/contact");
const paymentRoutes = require("./routes/payments");

const app = express();

// ---- Middleware ----
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
    cors({
        origin(origin, callback) {
            // allow same-origin / server-to-server calls (no Origin header) and anything listed in .env
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the admin panel (public/admin) at /admin
app.use("/admin", express.static(path.join(__dirname, "public/admin")));

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({ message: "Route not found." });
});

// Central error handler (catches thrown errors from async routes if wrapped)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Server error." });
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`LUXORA API running on http://localhost:${PORT}`);
        console.log(`Admin panel:        http://localhost:${PORT}/admin`);
    });
});
