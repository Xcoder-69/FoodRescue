const nodemailer = require('nodemailer');

// ─── Transporter Setup ────────────────────────────────────────────────────────

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️  SMTP_USER / SMTP_PASS not set — email sending is disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });

  return transporter;
};

// ─── Send Email Helper ────────────────────────────────────────────────────────

/**
 * Send an HTML email
 * @param {string} to        - Recipient email address
 * @param {string} subject   - Email subject line
 * @param {string} html      - HTML body content
 * @param {string} [text]    - Plain-text fallback (auto-stripped from HTML if omitted)
 * @returns {Promise<object|null>}
 */
const sendEmail = async (to, subject, html, text = '') => {
  const transport = getTransporter();

  if (!transport) {
    // In development without credentials, just log — don't crash
    console.log(`📧 [EMAIL SKIPPED — no credentials] To: ${to} | Subject: ${subject}`);
    return null;
  }

  try {
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || `FoodRescue <${emailUser}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''), // strip tags for plain-text fallback
    });

    console.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    // Email failure is non-fatal — log but don't throw
    console.error(`❌ Email failed to ${to}:`, err.message);
    return null;
  }
};

module.exports = { sendEmail };
