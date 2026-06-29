const { db } = require('../../config/firebase');
const EmailService = require('../email/email.service');
const bcrypt = require('bcryptjs');

const OTP_COLLECTION = 'otps';
const OTP_EXPIRY_MINS = 5;

// ─── Generate cryptographically safe 6-digit OTP ─────────────────────────────
function generateOTP() {
  const crypto = require('crypto');
  return String(crypto.randomInt(100000, 1000000));
}
async function storeOTP(email, otp, purpose) {
  const docId = `${email}_${purpose}`;
  const ref = db.collection(OTP_COLLECTION).doc(docId);
  
  // Track resend requests (max 3 per hour)
  const doc = await ref.get();
  let resendCount = 1;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (doc.exists) {
    const data = doc.data();
    if (data.createdAt && data.createdAt.toDate() > oneHourAgo) {
      resendCount = (data.resendCount || 0) + 1;
      if (resendCount > 3) {
        throw new Error('Too many OTP requests. Please try again in an hour.');
      }
    }
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINS * 60 * 1000);
  await ref.set({
    email, otp, purpose,
    expiresAt, used: false,
    createdAt: new Date(),
    resendCount,
    attempts: 0
  });
}

// ─── Verify OTP from Firestore ────────────────────────────────────────────────
async function verifyOTP(email, otp, purpose) {
  const ref = db.collection(OTP_COLLECTION).doc(`${email}_${purpose}`);
  const doc = await ref.get();

  if (!doc.exists)               throw new Error('OTP not found. Please request a new one.');
  const data = doc.data();
  
  if (data.attempts >= 5)        throw new Error('Too many failed attempts. Please request a new OTP.');
  if (data.used)                 throw new Error('OTP already used. Please request a new one.');
  if (new Date() > data.expiresAt.toDate()) throw new Error('OTP has expired. Please request a new one.');
  
  if (data.otp !== String(otp)) {
    await ref.update({ attempts: (data.attempts || 0) + 1 });
    throw new Error('Incorrect OTP. Please try again.');
  }

  await ref.update({ used: true, attempts: (data.attempts || 0) + 1 });
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
  await EmailService.sendOTPVerification(email, email.split('@')[0], otp, 'login', OTP_EXPIRY_MINS);
  return { message: `OTP sent to ${email}` };
}

/**
 * Send email verification OTP (after registration)
 */
async function sendVerifyOTP(email) {
  const otp = generateOTP();
  await storeOTP(email.toLowerCase(), otp, 'register');
  console.log(`\n========================================`);
  console.log(`📩 OTP GENERATED FOR ${email}: ${otp}`);
  console.log(`========================================\n`);
  await EmailService.sendOTPVerification(email, email.split('@')[0], otp, 'register', OTP_EXPIRY_MINS);
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
  await EmailService.sendOTPVerification(email, email.split('@')[0], otp, 'reset', OTP_EXPIRY_MINS);
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

  const userDoc = snap.docs[0];
  const uid = userDoc.id;

  // Store as passwordHash to match login service
  await userDoc.ref.update({
    passwordHash: hashed,
    updatedAt: new Date(),
  });

  // Revoke all active sessions for this user to prevent Session Hijacking persistence
  const sessionsSnap = await db.collection('sessions').where('userId', '==', uid).get();
  const batch = db.batch();
  sessionsSnap.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  if (!sessionsSnap.empty) {
    await batch.commit();
  }

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
