const ComplaintService = require('./complaint.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class ComplaintController {
  static async fileComplaint(req, res) {
    try {
      const result = await ComplaintService.fileComplaint(req.user.uid, req.body);
      return successResponse(res, 201, 'Complaint filed successfully', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getMyComplaints(req, res) {
    try {
      const data = await ComplaintService.getUserComplaints(req.user.uid);
      return successResponse(res, 200, 'Complaints fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}
module.exports = ComplaintController;
