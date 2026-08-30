const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Attaches req.user if a valid token is present, but never blocks the
// request — used for routes like checkout that also allow guests.
async function optionalAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) return next();

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (user) req.user = user;
    } catch (err) {
        // invalid/expired token on an optional route — just proceed as guest
    }
    next();
}

// Verifies the JWT and attaches req.user. Rejects if missing/invalid.
async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated." });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

// Use after requireAuth — rejects non-admins.
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
