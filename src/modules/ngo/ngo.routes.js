const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./ngo.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { uploadLimiter } = require('../../middleware/rateLimiter');
const { uploadMultiple } = require('../../config/cloudinary');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Invalid Indian phone number.',
  }),
  address: Joi.string().min(5).max(250).required(),
  city: Joi.string().min(2).max(60).required(),
  state: Joi.string().min(2).max(60).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Pincode must be 6 digits.',
  }),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  registrationNumber: Joi.string().min(3).max(50).required().messages({
    'any.required': 'NGO registration number is required.',
  }),
  capacity: Joi.number().integer().positive().max(10000).optional().default(100),
  openTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().default('08:00').messages({
    'string.pattern.base': 'Open time must be in HH:MM format.',
  }),
  closeTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().default('20:00').messages({
    'string.pattern.base': 'Close time must be in HH:MM format.',
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  address: Joi.string().min(5).max(250).optional(),
  city: Joi.string().min(2).max(60).optional(),
  state: Joi.string().min(2).max(60).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  capacity: Joi.number().integer().positive().max(10000).optional(),
  openTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  closeTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  registrationNumber: Joi.string().min(3).max(50).optional(),
}).min(1);

const nearbyQuerySchema = Joi.object({
  radius: Joi.number().positive().max(100).default(20),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const donationQuerySchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'volunteer_assigned', 'picked_up', 'delivered')
    .optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

// ─── Middleware shorthand ────────────────────────────────────────────────────
const auth = [verifyToken, requireRole('ngo')];

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/ngo/register
 * @access  NGO only
 */
router.post('/register', auth, validate(registerSchema), controller.register);

/**
 * @route   GET /api/ngo/profile
 * @access  NGO only
 */
router.get('/profile', auth, controller.getProfile);

/**
 * @route   PUT /api/ngo/profile
 * @access  NGO only
 */
router.put('/profile', auth, validate(updateProfileSchema), controller.updateProfile);

/**
 * @route   POST /api/ngo/profile/documents
 * @desc    Upload NGO docs (registration cert, trust deed, etc.)
 * @access  NGO only
 */
router.post(
  '/profile/documents',
  auth,
  uploadLimiter,
  uploadMultiple('documents', 5),
  controller.uploadDocuments
);

/**
 * @route   DELETE /api/ngo/profile/documents/:publicId
 * @access  NGO only
 */
router.delete('/profile/documents/:publicId', auth, controller.deleteDocument);

/**
 * @route   GET /api/ngo/donations/nearby
 * @desc    Get available donations sorted by distance from NGO
 * @access  NGO only
 */
router.get(
  '/donations/nearby',
  auth,
  validate(nearbyQuerySchema, 'query'),
  controller.getNearbyDonations
);

/**
 * @route   POST /api/ngo/donations/:id/accept
 * @desc    Accept a pending donation (NGO must be verified)
 * @access  NGO only
 */
router.post('/donations/:id/accept', auth, controller.acceptDonation);

/**
 * @route   GET /api/ngo/donations
 * @desc    Get accepted/ongoing donations for this NGO
 * @access  NGO only
 */
router.get(
  '/donations',
  auth,
  validate(donationQuerySchema, 'query'),
  controller.getMyDonations
);

/**
 * @route   GET /api/ngo/:id
 * @desc    Public NGO profile
 * @access  Any authenticated user
 */
router.get('/:id', verifyToken, controller.getNgoById);

module.exports = router;
