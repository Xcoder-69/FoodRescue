const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./restaurant.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { uploadLimiter } = require('../../middleware/rateLimiter');
const { uploadSingle, uploadMultiple } = require('../../config/cloudinary');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Invalid Indian phone number.',
  }),
  address: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(60).required(),
  state: Joi.string().min(2).max(60).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Pincode must be 6 digits.',
  }),
  lat: Joi.number().min(-90).max(90).required().messages({
    'any.required': 'Latitude is required.',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'any.required': 'Longitude is required.',
  }),
  licenseNumber: Joi.string().optional().allow('', null),
  fssaiNumber: Joi.string().optional().allow('', null),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  address: Joi.string().min(5).max(200).optional(),
  city: Joi.string().min(2).max(60).optional(),
  state: Joi.string().min(2).max(60).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  licenseNumber: Joi.string().optional().allow('', null),
  fssaiNumber: Joi.string().optional().allow('', null),
}).min(1);

const foodItemSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid('kg', 'g', 'pieces', 'litres', 'packets', 'boxes', 'servings').required(),
});

const createDonationSchema = Joi.object({
  foodItems: Joi.array().items(foodItemSchema).min(1).required().messages({
    'any.required': 'Food items are required.',
    'array.min': 'At least one food item is required.',
  }),
  servings: Joi.number().integer().positive().required().messages({
    'any.required': 'Number of servings is required.',
  }),
  expiryTime: Joi.string().isoDate().required().messages({
    'any.required': 'Food expiry time is required.',
    'string.isoDate': 'Expiry time must be a valid ISO date.',
  }),
  pickupByTime: Joi.string().isoDate().required().messages({
    'any.required': 'Pickup deadline is required.',
  }),
  notes: Joi.string().max(500).optional().allow(''),
});

const donationQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'accepted', 'volunteer_assigned', 'picked_up', 'delivered', 'cancelled', 'expired')
    .optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

// ─── Middleware shorthand ────────────────────────────────────────────────────
const auth = [verifyToken, requireRole('restaurant')];

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/restaurant/register
 * @desc    Complete restaurant profile setup
 * @access  Restaurant only
 */
router.post('/register', auth, validate(registerSchema), controller.register);

/**
 * @route   GET /api/restaurant/profile
 * @desc    Get own restaurant profile
 * @access  Restaurant only
 */
router.get('/profile', auth, controller.getProfile);

/**
 * @route   PUT /api/restaurant/profile
 * @desc    Update restaurant profile
 * @access  Restaurant only
 */
router.put('/profile', auth, validate(updateProfileSchema), controller.updateProfile);

/**
 * @route   POST /api/restaurant/profile/images
 * @desc    Upload restaurant images (multipart, field: "images", max 5)
 * @access  Restaurant only
 */
router.post(
  '/profile/images',
  auth,
  uploadLimiter,
  uploadMultiple('images', 5),
  controller.uploadImages
);

/**
 * @route   DELETE /api/restaurant/profile/images/:publicId
 * @desc    Delete a specific image by Cloudinary publicId
 * @access  Restaurant only
 */
router.delete('/profile/images/:publicId', auth, controller.deleteImage);

/**
 * @route   POST /api/restaurant/donations
 * @desc    Create a food donation request
 * @access  Restaurant only
 * @note    Supports optional food images (field: "images", max 3)
 */
router.post(
  '/donations',
  auth,
  uploadMultiple('images', 3),
  validate(createDonationSchema),
  controller.createDonation
);

/**
 * @route   GET /api/restaurant/donations
 * @desc    Get own donations (paginated, filterable by status)
 * @access  Restaurant only
 */
router.get(
  '/donations',
  auth,
  validate(donationQuerySchema, 'query'),
  controller.getMyDonations
);

/**
 * @route   GET /api/restaurant/donations/:id
 * @desc    Get single donation detail
 * @access  Restaurant only
 */
router.get('/donations/:id', auth, controller.getDonationById);

/**
 * @route   DELETE /api/restaurant/donations/:id
 * @desc    Cancel a pending/accepted donation
 * @access  Restaurant only
 */
router.delete('/donations/:id', auth, controller.cancelDonation);

/**
 * @route   GET /api/restaurant/:id
 * @desc    Get restaurant public profile (for NGOs/Volunteers)
 * @access  Any authenticated user
 */
router.get('/:id', verifyToken, controller.getRestaurantById);

module.exports = router;
