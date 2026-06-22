const OTPService    = require('./otp.service');
const AuthService   = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

// ─── Helper: set loading button label ────────────────────────────────────────
// (Backend only — no UI concern here, just controller logic)

class OTPController {

  // ── POST /api/auth/otp/send ────────────────────────────────────────────────
  // Send a login OTP to a registered email address
  static async sendLoginOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 400, 'Email is required.');

      const result = await OTPService.sendLoginOTP(email.toLowerCase().trim());
      return successResponse(res, 200, result.message, {});
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }

  // ── POST /api/auth/otp/verify ──────────────────────────────────────────────
  // Verify a login OTP, then issue JWT tokens directly (no password needed)
  static async verifyLoginOTP(req, res) {
    try {
      const { email, otp, deviceId } = req.body;
      if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required.');

      const normEmail = email.toLowerCase().trim();

      // 1. Verify the OTP exists and is valid
      await OTPService.verifyEmailOTP(normEmail, otp, 'login');

      // 2. Fetch user from Firestore
      const user = await OTPService.findUserByEmail(normEmail);
      if (!user) return errorResponse(res, 404, 'User not found.');
      if (user.status === 'BANNED') return errorResponse(res, 403, 'Account is suspended.');

      // 3. Create session & generate JWT tokens (reuse AuthService helper)
      const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
      const { db } = require('../../config/firebase');
      const jwt = require('jsonwebtoken');
      const crypto = require('crypto');

      // Create session doc
      const sessionRef = db.collection('sessions').doc();
      await sessionRef.set({
        userId:    user.uid || user.id,
        ipAddress,
        deviceId:  deviceId || 'otp-login',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const sessionId = sessionRef.id;
      const uid  = user.uid || user.id;
      const role = user.role || 'volunteer';

      const accessToken = jwt.sign(
        { uid, role, sessionId, is2FAVerified: true },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { uid, sessionId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      return successResponse(res, 200, 'OTP verified. Login successful.', {
        user:   { uid, email: user.email, role },
        tokens: { accessToken, refreshToken },
      });
    } catch (err) {
      return errorResponse(res, 401, err.message);
    }
  }

  // ── POST /api/auth/verify/send ─────────────────────────────────────────────
  // Send email verification OTP after registration
  static async sendVerifyOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 400, 'Email is required.');

      const result = await OTPService.sendVerifyOTP(email.toLowerCase().trim());
      return successResponse(res, 200, result.message, {});
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }

  // ── POST /api/auth/verify/confirm ──────────────────────────────────────────
  // Confirm the registration OTP → marks user as email-verified
  static async confirmEmailOTP(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required.');

      await OTPService.verifyEmailOTP(email.toLowerCase().trim(), otp, 'register');
      await OTPService.markEmailVerified(email.toLowerCase().trim());

      return successResponse(res, 200, 'Email verified successfully.', { emailVerified: true });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }

  // ── POST /api/auth/forgot-password ────────────────────────────────────────
  // Send a password-reset OTP (always returns 200 to prevent email enumeration)
  static async sendForgotPasswordOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 400, 'Email is required.');

      // Fire and forget — service handles "user not found" silently
      await OTPService.sendForgotPasswordOTP(email.toLowerCase().trim());
    } catch (_) {
      // Intentionally swallow errors to prevent email enumeration
    }

    // Always return success message (security best practice)
    return successResponse(res, 200,
      'If this email is registered, you will receive a reset OTP shortly.', {});
  }

  // ── POST /api/auth/reset-password ────────────────────────────────────────
  // Verify reset OTP and update the user's password
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return errorResponse(res, 400, 'Email, OTP, and new password are all required.');
      }
      if (newPassword.length < 8) {
        return errorResponse(res, 400, 'Password must be at least 8 characters long.');
      }

      const result = await OTPService.resetPasswordWithOTP(
        email.toLowerCase().trim(),
        otp.trim(),
        newPassword
      );

      return successResponse(res, 200, result.message, {});
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }
}

module.exports = OTPController;
