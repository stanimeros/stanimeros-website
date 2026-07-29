const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Escapes visitor-supplied text before it's interpolated into an email's HTML —
// without this, a visitor could submit a contact form or chat message containing
// live HTML/links that render in the owner's inbox.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Single place that actually sends mail to the site owner — used by both the
// contact form and the chat summary emails so there's one delivery path to reason about.
async function sendOwnerEmail({ subject, html }) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject,
    html,
  });
}

module.exports = { sendOwnerEmail, escapeHtml };
