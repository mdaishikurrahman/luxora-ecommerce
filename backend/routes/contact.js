const express = require("express");
const { body, validationResult } = require("express-validator");
const ContactMessage = require("../models/ContactMessage");
const { sendContactEmail } = require("../config/mailer");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/contact — used by contact.html
router.post(
    "/",
    [
        body("name").trim().notEmpty().withMessage("Name is required."),
        body("email").isEmail().withMessage("Valid email is required."),
        body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, phone = "", subject = "", message } = req.body;

        // Always save the message first — the form should never lose a
        // submission just because SMTP is unconfigured or briefly down.
        const saved = await ContactMessage.create({ name, email, phone, subject, message });

        try {
            await sendContactEmail({ name, email, phone, subject, message });
            saved.emailSent = true;
            await saved.save();
        } catch (err) {
            saved.emailError = err.message;
            await saved.save();
            console.warn("Contact email failed (message was still saved):", err.message);
        }

        res.status(201).json({
            message: "Message received.",
            emailSent: saved.emailSent,
        });
    }
);

// GET /api/contact — admin inbox
router.get("/", requireAuth, requireAdmin, async (req, res) => {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json({ items: messages });
});

// PUT /api/contact/:id/read — mark as read
router.put("/:id/read", requireAuth, requireAdmin, async (req, res) => {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: "Message not found." });
    res.json({ message: msg });
});

module.exports = router;
