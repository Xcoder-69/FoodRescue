const express = require('express');
const router = express.Router();
const AnalyticsController = require('./analytics.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

// Highly protected admin routes
router.use(requireAuth);
router.use(requireRole(['admin', 'superadmin']));

router.get('/global', AnalyticsController.getGlobalStats);
router.get('/trends', AnalyticsController.getTrends);

module.exports = router;
