const express = require('express');
const router = express.Router();
const DeliveryController = require('./delivery.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.use(requireAuth);

// Volunteers only
router.get('/available', requireRole(['volunteer']), DeliveryController.getAvailableDeliveries);
router.post('/:donationId/accept', requireRole(['volunteer']), DeliveryController.acceptDelivery);
router.patch('/:donationId/status', requireRole(['volunteer']), DeliveryController.updateDeliveryStatus);

module.exports = router;
