const express = require('express');
const router = express.Router();
const DonationController = require('./donation.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.use(requireAuth);

// Restaurants
router.post('/', requireRole(['restaurant']), DonationController.createDonation);
router.patch('/:id/cancel', requireRole(['restaurant']), DonationController.cancelDonation);

// NGOs
router.patch('/:id/claim', requireRole(['ngo']), DonationController.claimDonation);

// Mixed Access (Depends on filters applied in controller)
router.get('/', DonationController.getActiveDonations);
router.get('/:id', DonationController.getDonationById);

module.exports = router;
