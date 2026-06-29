const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const OTPController = require('./otp.controller');
const { requireAuth } = require('../../middleware/auth');
const { validate, authSchemas } = require('./auth.validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-test-ip'] || req.ip
});

// ─── Public Auth Routes ───────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(authSchemas.register), AuthController.register);
router.post('/login',    authLimiter, validate(authSchemas.login),    AuthController.login);
router.post('/google',   authLimiter, validate(authSchemas.google),   AuthController.googleLogin);
router.post('/refresh',  AuthController.refresh);

// ─── OTP: Login with Email OTP ────────────────────────────────────────────────
router.post('/otp/send',   authLimiter, OTPController.sendLoginOTP);
router.post('/otp/verify', authLimiter, OTPController.verifyLoginOTP);

// ─── OTP: Email Verification (after registration) ─────────────────────────────
router.post('/verify/send',   authLimiter, OTPController.sendVerifyOTP);
router.post('/verify/confirm', authLimiter, OTPController.confirmEmailOTP);

// ─── Forgot Password ──────────────────────────────────────────────────────────
router.post('/forgot-password',      authLimiter, OTPController.sendForgotPasswordOTP);
router.post('/reset-password',       authLimiter, OTPController.resetPassword);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.post('/logout', requireAuth, AuthController.logout);

// ─── Session Management ───────────────────────────────────────────────────────
router.get('/sessions',                requireAuth, AuthController.getSessions);
router.delete('/sessions/:sessionId',  requireAuth, AuthController.revokeSession);

// ─── 2FA Routes ───────────────────────────────────────────────────────────────
router.post('/2fa/setup',        requireAuth, AuthController.setup2FA);
router.post('/2fa/verify-setup', requireAuth, AuthController.verify2FASetup);
router.post('/2fa/verify-login', requireAuth, AuthController.verify2FALogin);

module.exports = router;
