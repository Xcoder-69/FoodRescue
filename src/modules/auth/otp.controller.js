const OTPService = require('./otp.service');
const AuthService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class OTPController {

  // ─── POST /api/auth/otp/send ─────────────────────────────────────────────
  // Send login OTP to a registered email
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

  // ─── POST /api/auth/otp/verify ───────────────────────────────────────────
  // Verify login OTP and return JWT tokens
  static async verifyLoginOTP(req, res) {
    try {
      const { email, otp, deviceId } = req.body;
      if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required.');
      
      // Verify OTP
      await OTPService.verifyOTP(email.toLowerCase().trim(), otp.trim(), 'login');
      
      // Get user and issue JWT
      const { db } = require('../../config/firebase');
      const snap = await db.collection('users').where('email', '==', email.toLowerCase().trim()).limit(1).get();
      if (snap.empty) return errorResponse(res, 404, 'User not found.');
      
      const userDoc = snap.docs[0];
      const user = userDoc.data();
      
      // Reuse AuthService token creation
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await AuthService.login(email, user.password, ipAddress, deviceId || 'otp-login');
      
      return successResponse(res, 200, 'OTP verified. Login successful.', result);
    } catch (err) {
      return errorResponse(res, 401, err.message);
    }
  }

  // ─── POST /api/auth/verify/send ──────────────────────────────────────────
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

  // ─── POST /api/auth/verify/confirm ───────────────────────────────────────
  // Confirm registration email OTP
  static async confirmEmailOTP(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required.');
      
      await OTPService.verifyOTP(email.toLowerCase().trim(), otp.trim(), 'register');
      
      // Mark user as email-verified in Firestore
      const { db } = require('../../config/firebase');
      const snap = await db.collection('users').where('email', '==', email.toLowerCase().trim()).limit(1).get();
      if (!snap.empty) {
        await snap.docs[0].ref.update({ emailVerified: true, emailVerifiedAt: new Date() });
      }
      
      return successResponse(res, 200, 'Email verified successfully.', { emailVerified: true });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }

  // ─── POST /api/auth/forgot-password ─────────────────────────────────────
  // Send forgot password OTP
  static async sendForgotPasswordOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 400, 'Email is required.');
      const result = await OTPService.sendForgotPasswordOTP(email.toLowerCase().trim());
      return successResponse(res, 200, result.message, {});
    } catch (err) {
      // Always return success to prevent email enumeration attacks
      return successResponse(res, 200, 'If this email is registered, you will receive an OTP shortly.', {});
    }
  }

  // ─── POST /api/auth/reset-password ──────────────────────────────────────
  // Reset password with OTP verification
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return errorResponse(res, 400, 'Email, OTP, and new password are required.');
      }
      if (newPassword.length < 8) {
        return errorResponse(res, 400, 'Password must be at least 8 characters.');
      }
      const result = await OTPService.resetPasswordWithOTP(
        email.toLowerCase().trim(), otp.trim(), newPassword
      );
      return successResponse(res, 200, result.message, {});
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  }
}

module.exports = OTPController;
