const DeliveryService = require('./delivery.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class DeliveryController {
  static async getAvailableDeliveries(req, res) {
    try {
      const data = await DeliveryService.getAvailableDeliveries();
      return successResponse(res, 200, 'Available deliveries fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async acceptDelivery(req, res) {
    try {
      const result = await DeliveryService.acceptDelivery(req.params.donationId, req.user.uid);
      return successResponse(res, 200, 'Delivery accepted', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async updateDeliveryStatus(req, res) {
    try {
      const { donationId } = req.params;
      const { status } = req.body;
      const result = await DeliveryService.updateDeliveryStatus(donationId, req.user.uid, status);
      return successResponse(res, 200, 'Delivery status updated', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}
module.exports = DeliveryController;
