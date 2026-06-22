const { db } = require('../../config/firebase');
const { sendEmail } = require('../../config/email');
const crypto = require('crypto');

const OTP_COLLECTION = 'otps';
const OTP_EXPIRY_MINS = 10;

// ─── Generate 6-digit OTP ────────────────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Generate secure reset token ─────────────────────────────────────────────
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ─── Email Templates ─────────────────────────────────────────────────────────
function otpEmailHtml(otp, purpose = 'login') {
  const titles = {
    login: 'Your Login OTP',
    register: 'Verify Your Email',
    reset: 'Password Reset OTP',
  };
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Inter, Arial, sans-serif; background: #f4fbf4; margin: 0; padding: 0; }
  .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,108,73,0.12); }
  .header { background: #006c49; padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 40px 32px; text-align: center; }
  .body p { color: #3c4a42; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
  .otp-box { background: #f4fbf4; border: 2px dashed #006c49; border-radius: 12px; padding: 20px; margin: 0 auto 28px; display: inline-block; }
  .otp { font-size: 42px; font-weight: 800; color: #006c49; letter-spacing: 12px; font-family: 'Courier New', monospace; }
  .expiry { color: #6c7a71; font-size: 13px; margin-top: 8px; }
  .footer { background: #f4fbf4; padding: 20px 32px; text-align: center; border-top: 1px solid #dde4dd; }
  .footer p { color: #6c7a71; font-size: 12px; margin: 0; }
  .warning { background: #fff8f0; border-left: 4px solid #fd761a; padding: 12px 16px; border-radius: 8px; text-align: left; margin-top: 16px; }
  .warning p { color: #783200; font-size: 13px; margin: 0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🍱 FoodRescue</h1>
    <p>Rescuing Food. Feeding Lives.</p>
  </div>
  <div class="body">
    <p><strong>${titles[purpose]}</strong></p>
    <p>Use the OTP below to ${purpose === 'reset' ? 'reset your password' : purpose === 'register' ? 'verify your email address' : 'complete your login'}.</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
      <div class="expiry">⏱ Valid for ${OTP_EXPIRY_MINS} minutes only</div>
    </div>
    <div class="warning">
      <p>⚠️ Never share this OTP with anyone. FoodRescue will never ask for your OTP.</p>
    </div>
  </div>
  <div class="footer">
    <p>If you didn't request this, please ignore this email or <a href="mailto:${process.env.SMTP_USER}" style="color:#006c49">contact support</a>.</p>
    <p style="margin-top:8px;">© ${new Date().getFullYear()} FoodRescue Platform</p>
  </div>
</div>
</body>
</html>`;
}

function resetLinkEmailHtml(resetToken) {
  const resetUrl = `${process.env.ALLOWED_ORIGINS || 'https://foodsrescue.vercel.app'}/4_login_and_verification.html?reset=${resetToken}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Inter, Arial, sans-serif; background: #f4fbf4; margin: 0; padding: 0; }
  .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,108,73,0.12); }
  .header { background: #006c49; padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; }
  .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 40px 32px; text-align: center; }
  .body p { color: #3c4a42; font-size: 15px; line-height: 1.6; }
  .btn { display: inline-block; background: #006c49; color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 999px; font-weight: 700; font-size: 16px; margin: 24px 0; }
  .expiry { color: #6c7a71; font-size: 13px; margin-top: 4px; }
  .url { word-break: break-all; color: #6c7a71; font-size: 12px; margin-top: 16px; }
  .warning { background: #fff8f0; border-left: 4px solid #fd761a; padding: 12px 16px; border-radius: 8px; text-align: left; margin-top: 16px; }
  .footer { background: #f4fbf4; padding: 20px 32px; text-align: center; border-top: 1px solid #dde4dd; }
  .footer p { color: #6c7a71; font-size: 12px; margin: 0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🍱 FoodRescue</h1>
    <p>Rescuing Food. Feeding Lives.</p>
  </div>
  <div class="body">
    <p><strong>Password Reset Request</strong></p>
    <p>We received a request to reset your FoodRescue account password. Click the button below to set a new password.</p>
    <a class="btn" href="${resetUrl}">🔐 Reset My Password</a>
    <div class="expiry">⏱ This link expires in 30 minutes</div>
    <div class="url">Or copy this link:<br>${resetUrl}</div>
    <div class="warning">
      <p>⚠️ If you didn't request a password reset, ignore this email. Your password will remain unchanged.</p>
    </div>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} FoodRescue Platform</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Store OTP in Firestore ───────────────────────────────────────────────────
async function storeOTP(email, otp, purpose) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINS * 60 * 1000);
  await db.collection(OTP_COLLECTION).doc(`${email}_${purpose}`).set({
    email, otp, purpose, expiresAt, used: false, createdAt: new Date()
  });
}

// ─── Verify OTP from Firestore ────────────────────────────────────────────────
async function verifyOTP(email, otp, purpose) {
  const doc = await db.collection(OTP_COLLECTION).doc(`${email}_${purpose}`).get();
  if (!doc.exists) throw new Error('OTP not found. Please request a new one.');
  const data = doc.data();
  if (data.used) throw new Error('OTP already used. Please request a new one.');
  if (new Date() > data.expiresAt.toDate()) throw new Error('OTP expired. Please request a new one.');
  if (data.otp !== otp) throw new Error('Invalid OTP. Please try again.');
  // Mark as used
  await doc.ref.update({ used: true });
  return true;
}

// ─── Send Login OTP ───────────────────────────────────────────────────────────
async function sendLoginOTP(email) {
  // Check user exists
  const snap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) throw new Error('No account found with this email address.');
  const otp = generateOTP();
  await storeOTP(email, otp, 'login');
  await sendEmail(email, `${otp} — Your FoodRescue Login OTP`, otpEmailHtml(otp, 'login'));
  return { message: `OTP sent to ${email}` };
}

// ─── Send Registration Verification OTP ──────────────────────────────────────
async function sendVerifyOTP(email) {
  const otp = generateOTP();
  await storeOTP(email, otp, 'register');
  await sendEmail(email, `${otp} — Verify your FoodRescue account`, otpEmailHtml(otp, 'register'));
  return { message: `Verification OTP sent to ${email}` };
}

// ─── Send Forgot Password OTP ─────────────────────────────────────────────────
async function sendForgotPasswordOTP(email) {
  const snap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) throw new Error('No account found with this email address.');
  const otp = generateOTP();
  await storeOTP(email, otp, 'reset');
  await sendEmail(email, `${otp} — Reset your FoodRescue password`, otpEmailHtml(otp, 'reset'));
  return { message: `Password reset OTP sent to ${email}` };
}

// ─── Reset Password after OTP verify ─────────────────────────────────────────
async function resetPasswordWithOTP(email, otp, newPassword) {
  await verifyOTP(email, otp, 'reset');
  // Hash new password with bcrypt
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(newPassword, 12);
  const snap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) throw new Error('User not found.');
  await snap.docs[0].ref.update({ password: hashed, updatedAt: new Date() });
  return { message: 'Password reset successfully.' };
}

module.exports = {
  sendLoginOTP,
  sendVerifyOTP,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  verifyOTP,
  storeOTP,
};
