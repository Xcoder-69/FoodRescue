const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and a number.',
      'any.required': 'Password is required.',
    }),
  displayName: Joi.string().min(2).max(60).required().messages({
    'any.required': 'Display name is required.',
    'string.min': 'Name must be at least 2 characters.',
  }),
  role: Joi.string().valid('restaurant', 'ngo', 'volunteer').required().messages({
    'any.only': 'Role must be restaurant, ngo, or volunteer.',
    'any.required': 'Role is required.',
  }),
  fcmToken: Joi.string().optional().allow('', null),
});

const googleSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required.',
  }),
  role: Joi.string().valid('restaurant', 'ngo', 'volunteer').optional(),
  fcmToken: Joi.string().optional().allow('', null),
});

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(60).optional(),
  photoURL: Joi.string().uri().optional().allow('', null),
  fcmToken: Joi.string().optional().allow('', null),
}).min(1).messages({ 'object.min': 'At least one field must be provided.' });

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address.',
    'any.required': 'Email is required.',
  }),
});

const fcmTokenSchema = Joi.object({
  fcmToken: Joi.string().required().messages({
    'any.required': 'FCM token is required.',
  }),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register with email/password
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  controller.register
);

/**
 * @route   POST /api/auth/google
 * @desc    Google Sign-In (verify Android Firebase ID token)
 * @access  Public
 */
router.post(
  '/google',
  authLimiter,
  validate(googleSchema),
  controller.googleSignIn
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, controller.getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/me',
  verifyToken,
  validate(updateProfileSchema),
  controller.updateMe
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  controller.resetPassword
);

/**
 * @route   PUT /api/auth/fcm-token
 * @desc    Update FCM token for push notifications
 * @access  Private
 */
router.put(
  '/fcm-token',
  verifyToken,
  validate(fcmTokenSchema),
  controller.updateFcmToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke refresh tokens
 * @access  Private
 */
router.post('/logout', verifyToken, controller.logout);

module.exports = router;
