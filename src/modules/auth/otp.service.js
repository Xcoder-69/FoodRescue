const { db } = require('../../config/firebase');
const { sendEmail } = require('../../config/email');
const bcrypt = require('bcryptjs');

const OTP_COLLECTION = 'otps';
const OTP_EXPIRY_MINS = 10;

// ─── Generate cryptographically safe 6-digit OTP ─────────────────────────────
function generateOTP() {
  const crypto = require('crypto');
  return String(100000 + (crypto.randomInt(900000)));
}

// ─── Email HTML templates ─────────────────────────────────────────────────────
function buildOtpEmail(otp, purpose = 'login') {
  const configs = {
    login:    { title: 'Your Login OTP',       action: 'complete your login'            },
    register: { title: 'Verify Your Email',    action: 'verify your email address'      },
    reset:    { title: 'Password Reset OTP',   action: 'reset your FoodRescue password' },
  };
  const { title, action } = configs[purpose] || configs.login;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4fbf4;padding:32px 16px}
  .card{max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,108,73,0.14)}
  .header{background:linear-gradient(135deg,#006c49 0%,#00865a 100%);padding:36px 32px;text-align:center}
  .header-logo{font-size:28px;margin-bottom:8px}
  .header h1{color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px}
  .header p{color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px}
  .body{padding:40px 32px;text-align:center}
  .greeting{color:#3c4a42;font-size:15px;line-height:1.7;margin-bottom:28px}
  .otp-wrap{display:inline-block;background:#f4fbf4;border:2px dashed #006c49;border-radius:16px;padding:24px 40px;margin-bottom:24px}
  .otp-code{font-family:'Courier New',Courier,monospace;font-size:44px;font-weight:800;color:#006c49;letter-spacing:14px;line-height:1}
  .otp-expiry{color:#6c7a71;font-size:12px;margin-top:10px}
  .warning{background:#fff8f0;border-left:4px solid #fd761a;border-radius:8px;padding:14px 18px;text-align:left;margin-top:4px}
  .warning p{color:#783200;font-size:13px;line-height:1.5}
  .footer{background:#f4fbf4;border-top:1px solid #e8f0e9;padding:20px 32px;text-align:center}
  .footer p{color:#9aab9f;font-size:11px;line-height:1.6}
  .footer a{color:#006c49;text-decoration:none}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="header-logo">🍱</div>
    <h1>FoodRescue</h1>
    <p>Rescuing Food. Feeding Lives.</p>
  </div>
  <div class="body">
    <p class="greeting"><strong>${title}</strong><br><br>
      Use the one-time code below to ${action}.<br>
      Do not share this code with anyone.
    </p>
    <div class="otp-wrap">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry">⏱ Expires in ${OTP_EXPIRY_MINS} minutes</div>
    </div>
    <div class="warning">
      <p>⚠️ <strong>FoodRescue will never call or message you to ask for this code.</strong>
        If you didn't request this, please ignore this email and your account will remain secure.</p>
    </div>
  </div>
  <div class="footer">
    <p>Questions? <a href="mailto:${smtpUser}">Contact support</a><br>
      © ${new Date().getFullYear()} FoodRescue Platform · All rights reserved</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Store OTP in Firestore (one record per email+purpose) ────────────────────
async function storeOTP(email, otp, purpose) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINS * 60 * 1000);
  await db.collection(OTP_COLLECTION).doc(`${email}_${purpose}`).set({
    email, otp, purpose,
    expiresAt, used: false,
    createdAt: new Date(),
  });
}

// ─── Verify OTP from Firestore ────────────────────────────────────────────────
async function verifyOTP(email, otp, purpose) {
  const ref = db.collection(OTP_COLLECTION).doc(`${email}_${purpose}`);
  const doc = await ref.get();

  if (!doc.exists)               throw new Error('OTP not found. Please request a new one.');
  const data = doc.data();
  if (data.used)                 throw new Error('OTP already used. Please request a new one.');
  if (new Date() > data.expiresAt.toDate()) throw new Error('OTP has expired. Please request a new one.');
  if (data.otp !== String(otp))  throw new Error('Incorrect OTP. Please try again.');

  await ref.update({ used: true });
  return true;
}

// ─── Lookup user by email (normalised) ───────────────────────────────────────
async function findUserByEmail(email) {
  const snap = await db.collection('users')
    .where('email', '==', email.toLowerCase().trim())
    .limit(1)
    .get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send login OTP to a registered email
 */
async function sendLoginOTP(email) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No account found with this email address.');
  if (user.status === 'BANNED') throw new Error('This account has been suspended.');

  const otp = generateOTP();
  await storeOTP(email.toLowerCase(), otp, 'login');
  await sendEmail(
    email,
    `${otp} is your FoodRescue login code`,
    buildOtpEmail(otp, 'login')
  );
  return { message: `OTP sent to ${email}` };
}

/**
 * Send email verification OTP (after registration)
 */
async function sendVerifyOTP(email) {
  const otp = generateOTP();
  await storeOTP(email.toLowerCase(), otp, 'register');
  await sendEmail(
    email,
    `${otp} — Verify your FoodRescue account`,
    buildOtpEmail(otp, 'register')
  );
  return { message: `Verification OTP sent to ${email}` };
}

/**
 * Send forgot-password OTP to a registered email.
 * Always resolves (no enumeration) — caller should show generic message.
 */
async function sendForgotPasswordOTP(email) {
  const user = await findUserByEmail(email);
  if (!user) return; // Silently skip — caller returns generic 200

  const otp = generateOTP();
  await storeOTP(email.toLowerCase(), otp, 'reset');
  await sendEmail(
    email,
    `${otp} — Reset your FoodRescue password`,
    buildOtpEmail(otp, 'reset')
  );
}

/**
 * Reset password: verify OTP then hash & store new password
 */
async function resetPasswordWithOTP(email, otp, newPassword) {
  const normEmail = email.toLowerCase().trim();
  await verifyOTP(normEmail, String(otp), 'reset');

  const hashed = await bcrypt.hash(newPassword, 12);

  const snap = await db.collection('users').where('email', '==', normEmail).limit(1).get();
  if (snap.empty) throw new Error('User not found.');

  // Store as passwordHash to match login service
  await snap.docs[0].ref.update({
    passwordHash: hashed,
    updatedAt: new Date(),
  });

  return { message: 'Password reset successfully. Please log in with your new password.' };
}

/**
 * Verify a login or register OTP (generic entry point)
 */
async function verifyEmailOTP(email, otp, purpose) {
  return verifyOTP(email.toLowerCase().trim(), String(otp), purpose);
}

/**
 * Mark user's email as verified in Firestore
 */
async function markEmailVerified(email) {
  const snap = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (!snap.empty) {
    await snap.docs[0].ref.update({ isEmailVerified: true, emailVerifiedAt: new Date() });
  }
}

module.exports = {
  sendLoginOTP,
  sendVerifyOTP,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  verifyEmailOTP,
  verifyOTP,
  findUserByEmail,
  markEmailVerified,
};
