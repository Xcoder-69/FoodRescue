const express = require('express');
const router = express.Router();
const RestaurantController = require('./restaurant.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['restaurant']));

router.post('/profile', RestaurantController.updateProfile);
router.get('/profile', RestaurantController.getProfile);
router.put('/profile', RestaurantController.updateProfile);
router.get('/dashboard', RestaurantController.getDashboard);

module.exports = router;
