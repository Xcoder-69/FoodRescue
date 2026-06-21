const VolunteerService = require('./volunteer.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class VolunteerController {
  static async updateProfile(req, res) {
    try {
      const result = await VolunteerService.updateProfile(req.user.uid, req.body);
      return successResponse(res, 200, 'Profile updated', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getProfile(req, res) {
    try {
      const data = await VolunteerService.getProfile(req.user.uid);
      return successResponse(res, 200, 'Profile fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getDashboard(req, res) {
    try {
      const data = await VolunteerService.getDashboardStats(req.user.uid);
      return successResponse(res, 200, 'Dashboard fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}
module.exports = VolunteerController;
