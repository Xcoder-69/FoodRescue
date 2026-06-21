const express = require('express');
const router = express.Router();
const VolunteerController = require('./volunteer.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['volunteer']));

router.post('/profile', VolunteerController.updateProfile);
router.get('/profile', VolunteerController.getProfile);
router.put('/profile', VolunteerController.updateProfile);
router.get('/dashboard', VolunteerController.getDashboard);

module.exports = router;
