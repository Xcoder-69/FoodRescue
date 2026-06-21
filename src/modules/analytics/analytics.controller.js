const AnalyticsService = require('./analytics.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class AnalyticsController {
  static async getGlobalStats(req, res) {
    try {
      const data = await AnalyticsService.getPlatformStats();
      return successResponse(res, 200, 'Global stats fetched', data);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async getTrends(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const data = await AnalyticsService.getDailyTrends(days);
      return successResponse(res, 200, 'Trend data fetched', data);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}
module.exports = AnalyticsController;
