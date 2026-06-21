const AdminService = require('./admin.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class AdminController {
  
  // 1. User Management
  static async getApprovals(req, res) {
    try {
      const { role } = req.params; // 'restaurant', 'ngo', 'volunteer'
      const data = await AdminService.getApprovals(role);
      return successResponse(res, 200, 'Pending approvals fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { uid } = req.params;
      const { status } = req.body; // 'APPROVED', 'REJECTED', 'SUSPENDED', 'BANNED'
      const adminUid = req.user.uid;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const data = await AdminService.updateUserStatus(adminUid, uid, status, ipAddress);
      return successResponse(res, 200, `User status updated to ${status}`, data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  // 2. Fraud & Security
  static async getFraudReports(req, res) {
    try {
      const data = await AdminService.getFraudReports();
      return successResponse(res, 200, 'Fraud reports fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async resolveFraudReport(req, res) {
    try {
      const { reportId } = req.params;
      const adminUid = req.user.uid;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const data = await AdminService.resolveFraudReport(adminUid, reportId, ipAddress);
      return successResponse(res, 200, 'Fraud report resolved', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getSystemStatus(req, res) {
    try {
      const data = await AdminService.getSystemStatus();
      return successResponse(res, 200, 'System status fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  // 3. Audit Ledger
  static async getAuditLogs(req, res) {
    try {
      const { limit } = req.query;
      const data = await AdminService.getAuditLogs(Number(limit) || 100);
      return successResponse(res, 200, 'Audit logs fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  // 4. Complaints
  static async getComplaints(req, res) {
    try {
      const data = await AdminService.getComplaints();
      return successResponse(res, 200, 'Complaints fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminUid = req.user.uid;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const data = await AdminService.updateComplaintStatus(adminUid, id, status, ipAddress);
      return successResponse(res, 200, 'Complaint status updated', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  // 5. Global Sessions
  static async getAllSessions(req, res) {
    try {
      const data = await AdminService.getAllSessions();
      return successResponse(res, 200, 'All sessions fetched', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async revokeUserSessions(req, res) {
    try {
      const { targetUid } = req.params;
      const adminUid = req.user.uid;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const data = await AdminService.revokeAllUserSessions(adminUid, targetUid, ipAddress);
      return successResponse(res, 200, 'All sessions for user revoked', data);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = AdminController;
