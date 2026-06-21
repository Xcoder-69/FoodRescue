const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./donation.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const getAllSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'accepted', 'volunteer_assigned', 'picked_up', 'delivered', 'cancelled', 'expired')
    .optional(),
  city: Joi.string().optional(),
  restaurantId: Joi.string().optional(),
  ngoId: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

const statsSchema = Joi.object({
  restaurantId: Joi.string().optional(),
  ngoId: Joi.string().optional(),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/donations/stats
 * @desc    Get donation counts by status
 * @access  Any authenticated user
 * @note    Must come before /:id to avoid "stats" being treated as an id
 */
router.get(
  '/stats',
  verifyToken,
  validate(statsSchema, 'query'),
  controller.getDonationStats
);

/**
 * @route   POST /api/donations/expire
 * @desc    Mark overdue pending donations as expired (Admin only)
 * @access  Admin only
 */
router.post(
  '/expire',
  verifyToken,
  requireRole('admin'),
  controller.expireOldDonations
);

/**
 * @route   GET /api/donations
 * @desc    List all donations with optional filters
 * @access  Any authenticated user
 */
router.get(
  '/',
  verifyToken,
  validate(getAllSchema, 'query'),
  controller.getAllDonations
);

/**
 * @route   GET /api/donations/:id
 * @desc    Get single donation detail
 * @access  Any authenticated user
 */
router.get('/:id', verifyToken, controller.getDonationById);

/**
 * @route   GET /api/donations/:id/track
 * @desc    Live tracking — donation status + volunteer location
 * @access  Involved parties only (restaurant, NGO, volunteer, admin)
 */
router.get('/:id/track', verifyToken, controller.getDonationTracking);

/**
 * @route   POST /api/donations/:id/assign-volunteer
 * @desc    Auto-assign nearest available volunteer
 * @access  NGO (accepted the donation) or Admin
 */
router.post(
  '/:id/assign-volunteer',
  verifyToken,
  requireRole('ngo', 'admin'),
  controller.assignVolunteer
);

/**
 * @route   POST /api/donations/:id/assign-volunteer/:volunteerId
 * @desc    Manually assign a specific volunteer
 * @access  NGO (accepted the donation) or Admin
 */
router.post(
  '/:id/assign-volunteer/:volunteerId',
  verifyToken,
  requireRole('ngo', 'admin'),
  controller.assignSpecificVolunteer
);

module.exports = router;
