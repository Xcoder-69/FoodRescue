const express = require('express');
const router = express.Router();
const NgoController = require('./ngo.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['ngo']));

router.post('/profile', NgoController.updateProfile);
router.get('/profile', NgoController.getProfile);
router.put('/profile', NgoController.updateProfile);
router.get('/dashboard', NgoController.getDashboard);

module.exports = router;
