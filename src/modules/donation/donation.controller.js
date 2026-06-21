const DonationService = require('./donation.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class DonationController {
  static async createDonation(req, res) {
    try {
      const result = await DonationService.createDonation(req.user.uid, req.body);
      return successResponse(res, 201, 'Donation created', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getDonationById(req, res) {
    try {
      const data = await DonationService.getDonationById(req.params.id);
      return successResponse(res, 200, 'Donation fetched', data);
    } catch (error) {
      return errorResponse(res, 404, error.message);
    }
  }

  static async getActiveDonations(req, res) {
    try {
      // Build filters based on role
      const filters = {};
      if (req.user.role === 'restaurant') filters.restaurantId = req.user.uid;
      if (req.user.role === 'ngo') filters.status = 'AVAILABLE';
      
      const data = await DonationService.getActiveDonations(filters);
      return successResponse(res, 200, 'Donations fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async claimDonation(req, res) {
    try {
      const result = await DonationService.claimDonation(req.params.id, req.user.uid);
      return successResponse(res, 200, 'Donation claimed successfully', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async cancelDonation(req, res) {
    try {
      const result = await DonationService.cancelDonation(req.params.id, req.user.uid);
      return successResponse(res, 200, 'Donation cancelled', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}
module.exports = DonationController;
