const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./notification.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const listSchema = Joi.object({
  unreadOnly: Joi.string().valid('true', 'false').optional().default('false'),
  limit: Joi.number().integer().min(1).max(50).default(20),
  cursor: Joi.string().optional(),
});

const sendManualSchema = Joi.object({
  recipientId: Joi.string().required().messages({
    'any.required': 'recipientId (Firebase UID) is required.',
  }),
  title: Joi.string().min(1).max(100).required(),
  body: Joi.string().min(1).max(300).required(),
  type: Joi.string().optional().default('manual'),
  data: Joi.object().optional().default({}),
});

const broadcastSchema = Joi.object({
  role: Joi.string().valid('restaurant', 'ngo', 'volunteer').required().messages({
    'any.only': 'Role must be restaurant, ngo, or volunteer.',
    'any.required': 'Role is required.',
  }),
  title: Joi.string().min(1).max(100).required(),
  body: Joi.string().min(1).max(300).required(),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Authenticated
 * @note    Must be before /:id route
 */
router.get('/unread-count', verifyToken, controller.getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Authenticated
 * @note    Must be before /:id route
 */
router.patch('/read-all', verifyToken, controller.markAllAsRead);

/**
 * @route   POST /api/notifications/send
 * @desc    Send manual notification to a specific user (Admin only)
 * @access  Admin
 */
router.post(
  '/send',
  verifyToken,
  requireRole('admin'),
  validate(sendManualSchema),
  controller.sendManualNotification
);

/**
 * @route   POST /api/notifications/broadcast
 * @desc    Broadcast FCM to all users of a role (Admin only)
 * @access  Admin
 */
router.post(
  '/broadcast',
  verifyToken,
  requireRole('admin'),
  validate(broadcastSchema),
  controller.broadcastToRole
);

/**
 * @route   GET /api/notifications
 * @desc    Get my notifications (paginated)
 * @access  Authenticated
 */
router.get(
  '/',
  verifyToken,
  validate(listSchema, 'query'),
  controller.getMyNotifications
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Authenticated (owner only)
 */
router.patch('/:id/read', verifyToken, controller.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Authenticated (owner only)
 */
router.delete('/:id', verifyToken, controller.deleteNotification);

module.exports = router;
