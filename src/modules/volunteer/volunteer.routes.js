const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./volunteer.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { locationLimiter } = require('../../middleware/rateLimiter');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Invalid Indian phone number.',
  }),
  vehicleType: Joi.string()
    .valid('bicycle', 'motorcycle', 'car', 'auto', 'van', 'walk')
    .required()
    .messages({ 'any.only': 'Vehicle type must be bicycle, motorcycle, car, auto, van, or walk.' }),
  vehicleNumber: Joi.string().max(20).optional().allow('', null),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  vehicleType: Joi.string()
    .valid('bicycle', 'motorcycle', 'car', 'auto', 'van', 'walk')
    .optional(),
  vehicleNumber: Joi.string().max(20).optional().allow('', null),
}).min(1);

const locationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'any.required': 'Latitude is required.',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'any.required': 'Longitude is required.',
  }),
  heading: Joi.number().min(0).max(360).optional().default(0),
  speed: Joi.number().min(0).optional().default(0),
});

const availabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().messages({
    'any.required': 'isAvailable (true/false) is required.',
  }),
});

const pickupQuerySchema = Joi.object({
  status: Joi.string().valid('volunteer_assigned', 'picked_up').optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

const historyQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

// ─── Middleware shorthand ────────────────────────────────────────────────────
const auth = [verifyToken, requireRole('volunteer')];

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/volunteer/register
 * @access  Volunteer only
 */
router.post('/register', auth, validate(registerSchema), controller.register);

/**
 * @route   GET /api/volunteer/profile
 * @access  Volunteer only
 */
router.get('/profile', auth, controller.getProfile);

/**
 * @route   PUT /api/volunteer/profile
 * @access  Volunteer only
 */
router.put('/profile', auth, validate(updateProfileSchema), controller.updateProfile);

/**
 * @route   POST /api/volunteer/location
 * @desc    Send live GPS coordinates (rate limited to 30/min = every 2s)
 * @access  Volunteer only
 */
router.post(
  '/location',
  auth,
  locationLimiter,
  validate(locationSchema),
  controller.updateLocation
);

/**
 * @route   PUT /api/volunteer/availability
 * @desc    Toggle online/offline status
 * @access  Volunteer only
 */
router.put(
  '/availability',
  auth,
  validate(availabilitySchema),
  controller.toggleAvailability
);

/**
 * @route   GET /api/volunteer/pickups
 * @desc    Get my active pickup tasks
 * @access  Volunteer only
 */
router.get(
  '/pickups',
  auth,
  validate(pickupQuerySchema, 'query'),
  controller.getMyPickups
);

/**
 * @route   POST /api/volunteer/pickups/:id/pickup
 * @desc    Mark food as picked up from restaurant
 * @access  Volunteer only
 */
router.post('/pickups/:id/pickup', auth, controller.markPickedUp);

/**
 * @route   POST /api/volunteer/pickups/:id/deliver
 * @desc    Mark food as delivered to NGO
 * @access  Volunteer only
 */
router.post('/pickups/:id/deliver', auth, controller.markDelivered);

/**
 * @route   GET /api/volunteer/history
 * @desc    Completed delivery history
 * @access  Volunteer only
 */
router.get(
  '/history',
  auth,
  validate(historyQuerySchema, 'query'),
  controller.getDeliveryHistory
);

/**
 * @route   GET /api/volunteer/:id/location
 * @desc    Get live location of a volunteer (for NGO/admin tracking)
 * @access  Any authenticated user
 */
router.get('/:id/location', verifyToken, controller.getVolunteerLocation);

/**
 * @route   GET /api/volunteer/:id
 * @desc    Public volunteer profile
 * @access  Any authenticated user
 */
router.get('/:id', verifyToken, controller.getVolunteerById);

module.exports = router;
