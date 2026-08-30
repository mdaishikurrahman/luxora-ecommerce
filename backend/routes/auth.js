const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
    };
}

// POST /api/auth/register — customer signup
router.post(
    "/register",
    [
        body("name").trim().notEmpty().withMessage("Name is required."),
        body("email").isEmail().withMessage("Valid email is required."),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const existing = await User.findOne({ email: req.body.email.toLowerCase() });
            if (existing) {
                return res.status(409).json({ message: "An account with this email already exists." });
            }

            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });

            const token = signToken(user);
            res.status(201).json({ token, user: publicUser(user) });
        } catch (err) {
            res.status(500).json({ message: "Registration failed.", error: err.message });
        }
    }
);

// POST /api/auth/login — works for customers and admins
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required."),
        body("password").notEmpty().withMessage("Password is required."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
            if (!user || !(await user.comparePassword(req.body.password))) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            const token = signToken(user);
            res.json({ token, user: publicUser(user) });
        } catch (err) {
            res.status(500).json({ message: "Login failed.", error: err.message });
        }
    }
);

// GET /api/auth/me — current logged-in user
router.get("/me", requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

module.exports = router;
