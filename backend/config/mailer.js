const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null; // not configured — caller should handle gracefully
    }

    cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports (STARTTLS)
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    return cachedTransporter;
}

/**
 * Sends the contact form submission to CONTACT_RECEIVER_EMAIL, and a
 * short confirmation back to the person who submitted the form.
 * Throws if SMTP isn't configured or the send fails — callers should
 * catch this and still save the message to the database either way.
 */
async function sendContactEmail({ name, email, phone, subject, message }) {
    const transporter = getTransporter();

    if (!transporter) {
        throw new Error("Email is not configured on the server (SMTP_* env vars missing).");
    }

    const receiver = process.env.CONTACT_RECEIVER_EMAIL;
    if (!receiver) {
        throw new Error("CONTACT_RECEIVER_EMAIL is not set.");
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;

    // Notify the store
    await transporter.sendMail({
        from,
        to: receiver,
        replyTo: email,
        subject: `[LUXORA Contact] ${subject || "New message"} — ${name}`,
        text: `From: ${name} <${email}>\nPhone: ${phone || "—"}\nSubject: ${subject || "—"}\n\n${message}`,
        html: `
            <div style="font-family: sans-serif; font-size: 14px; color: #222;">
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
                <p><strong>Subject:</strong> ${escapeHtml(subject || "—")}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
            </div>
        `,
    });

    // Confirmation back to the customer (best-effort — failure here doesn't fail the request)
    try {
        await transporter.sendMail({
            from,
            to: email,
            subject: "We received your message — LUXORA",
            text: `Hi ${name},\n\nThanks for reaching out to LUXORA. We received your message and will get back to you soon.\n\n— LUXORA Team`,
            html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out to LUXORA. We received your message and will get back to you soon.</p><p>— LUXORA Team</p>`,
        });
    } catch (err) {
        console.warn("Confirmation email to customer failed (non-fatal):", err.message);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

module.exports = { sendContactEmail };
