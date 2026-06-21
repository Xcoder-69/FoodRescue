const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./admin.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const usersQuerySchema = Joi.object({
  role: Joi.string().valid('restaurant', 'ngo', 'volunteer', 'admin').optional(),
  search: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

const suspendSchema = Joi.object({
  reason: Joi.string().min(5).max(300).required().messages({
    'any.required': 'Suspension reason is required.',
    'string.min': 'Reason must be at least 5 characters.',
  }),
});

const resolveReportSchema = Joi.object({
  adminNote: Joi.string().max(500).optional().allow(''),
  action: Joi.string()
    .valid('warning_issued', 'account_suspended', 'content_removed', 'no_action', 'none')
    .optional()
    .default('none'),
});

const reportsQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'resolved', 'dismissed').optional(),
  limit: Joi.number().integer().min(1).max(50).default(10),
  cursor: Joi.string().optional(),
});

const pendingVerifSchema = Joi.object({
  role: Joi.string().valid('restaurant', 'ngo').optional().default('ngo'),
});

const submitReportSchema = Joi.object({
  reportedEntityId: Joi.string().required().messages({
    'any.required': 'reportedEntityId is required.',
  }),
  entityType: Joi.string()
    .valid('user', 'donation', 'restaurant', 'ngo', 'volunteer')
    .required()
    .messages({ 'any.required': 'entityType is required.' }),
  reason: Joi.string()
    .valid('spam', 'fraud', 'food_quality', 'misconduct', 'fake_profile', 'other')
    .required()
    .messages({ 'any.required': 'Reason is required.' }),
  description: Joi.string().max(500).optional().allow(''),
});

// ─── Middleware shorthands ────────────────────────────────────────────────────
const adminOnly = [verifyToken, requireRole('admin')];
const authenticated = [verifyToken];

// ─── Public (to any authenticated user) ─────────────────────────────────────

/**
 * @route   POST /api/admin/reports
 * @desc    Submit a complaint/report (any authenticated user)
 * @access  Authenticated
 */
router.post(
  '/reports',
  authenticated,
  validate(submitReportSchema),
  controller.submitReport
);

// ─── Admin only routes ───────────────────────────────────────────────────────

/**
 * @route   GET /api/admin/stats
 * @desc    Platform-wide stats dashboard
 * @access  Admin
 */
router.get('/stats', adminOnly, controller.getPlatformStats);

/**
 * @route   GET /api/admin/users
 * @desc    List all users (filterable by role, searchable by name/email)
 * @access  Admin
 */
router.get(
  '/users',
  adminOnly,
  validate(usersQuerySchema, 'query'),
  controller.getAllUsers
);

/**
 * @route   GET /api/admin/users/:uid
 * @desc    Get full user details including role profile
 * @access  Admin
 */
router.get('/users/:uid', adminOnly, controller.getUserDetails);

/**
 * @route   PATCH /api/admin/users/:uid/verify
 * @desc    Verify NGO or restaurant account
 * @access  Admin
 */
router.patch('/users/:uid/verify', adminOnly, controller.verifyAccount);

/**
 * @route   PATCH /api/admin/users/:uid/suspend
 * @desc    Suspend user account (force logout, notify)
 * @access  Admin
 */
router.patch(
  '/users/:uid/suspend',
  adminOnly,
  validate(suspendSchema),
  controller.suspendUser
);

/**
 * @route   PATCH /api/admin/users/:uid/unsuspend
 * @desc    Reinstate suspended user
 * @access  Admin
 */
router.patch('/users/:uid/unsuspend', adminOnly, controller.unsuspendUser);

/**
 * @route   PATCH /api/admin/users/:uid/promote
 * @desc    Promote a user to admin role
 * @access  Admin
 */
router.patch('/users/:uid/promote', adminOnly, controller.promoteToAdmin);

/**
 * @route   DELETE /api/admin/users/:uid
 * @desc    Permanently delete user (Auth + Firestore)
 * @access  Admin
 */
router.delete('/users/:uid', adminOnly, controller.deleteUser);

/**
 * @route   GET /api/admin/reports
 * @desc    Get all submitted reports/complaints
 * @access  Admin
 */
router.get(
  '/reports',
  adminOnly,
  validate(reportsQuerySchema, 'query'),
  controller.getAllReports
);

/**
 * @route   PATCH /api/admin/reports/:id/resolve
 * @desc    Resolve a report with admin note and action taken
 * @access  Admin
 */
router.patch(
  '/reports/:id/resolve',
  adminOnly,
  validate(resolveReportSchema),
  controller.resolveReport
);

/**
 * @route   GET /api/admin/verifications/pending
 * @desc    Get NGOs/restaurants awaiting verification
 * @access  Admin
 */
router.get(
  '/verifications/pending',
  adminOnly,
  validate(pendingVerifSchema, 'query'),
  controller.getPendingVerifications
);

module.exports = router;
