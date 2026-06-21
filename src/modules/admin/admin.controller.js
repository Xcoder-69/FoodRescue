const service = require('./admin.service');
const { sendSuccess, sendCreated } = require('../../utils/apiResponse');

/**
 * GET /api/admin/users
 * Query: ?role=ngo&search=foodbank&limit=10
 */
const getAllUsers = async (req, res) => {
  const result = await service.getAllUsers(req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * GET /api/admin/users/:uid
 */
const getUserDetails = async (req, res) => {
  const result = await service.getUserDetails(req.params.uid);
  return sendSuccess(res, { data: result });
};

/**
 * PATCH /api/admin/users/:uid/verify
 */
const verifyAccount = async (req, res) => {
  const result = await service.verifyAccount(req.params.uid, req.user.uid);
  return sendSuccess(res, { message: 'Account verified successfully.', data: result });
};

/**
 * PATCH /api/admin/users/:uid/suspend
 * Body: { reason }
 */
const suspendUser = async (req, res) => {
  const result = await service.suspendUser(req.params.uid, req.body.reason, req.user.uid);
  return sendSuccess(res, { message: 'User suspended and logged out.', data: result });
};

/**
 * PATCH /api/admin/users/:uid/unsuspend
 */
const unsuspendUser = async (req, res) => {
  const result = await service.unsuspendUser(req.params.uid);
  return sendSuccess(res, { message: 'User reinstated.', data: result });
};

/**
 * DELETE /api/admin/users/:uid
 */
const deleteUser = async (req, res) => {
  const result = await service.deleteUser(req.params.uid, req.user.uid);
  return sendSuccess(res, { message: 'User permanently deleted.', data: result });
};

/**
 * PATCH /api/admin/users/:uid/promote
 */
const promoteToAdmin = async (req, res) => {
  const result = await service.promoteToAdmin(req.params.uid);
  return sendSuccess(res, { message: 'User promoted to admin.', data: result });
};

/**
 * GET /api/admin/stats
 */
const getPlatformStats = async (req, res) => {
  const stats = await service.getPlatformStats();
  return sendSuccess(res, { data: stats });
};

/**
 * GET /api/admin/reports
 * Query: ?status=pending&limit=10
 */
const getAllReports = async (req, res) => {
  const result = await service.getAllReports(req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * PATCH /api/admin/reports/:id/resolve
 * Body: { adminNote, action }
 */
const resolveReport = async (req, res) => {
  const result = await service.resolveReport(req.params.id, req.body.adminNote, req.body.action);
  return sendSuccess(res, { message: 'Report resolved.', data: result });
};

/**
 * GET /api/admin/verifications/pending
 * Query: ?role=ngo (or restaurant)
 */
const getPendingVerifications = async (req, res) => {
  const { role } = req.query;
  const result = await service.getPendingVerifications(role || 'ngo');
  return sendSuccess(res, {
    data: result,
    meta: { count: result.length },
  });
};

/**
 * POST /api/admin/reports
 * Any user can submit a report
 * Body: { reportedEntityId, entityType, reason, description }
 */
const submitReport = async (req, res) => {
  const result = await service.submitReport(req.user.uid, req.body);
  return sendCreated(res, { message: 'Report submitted. Admin will review shortly.', data: result });
};

module.exports = {
  getAllUsers,
  getUserDetails,
  verifyAccount,
  suspendUser,
  unsuspendUser,
  deleteUser,
  promoteToAdmin,
  getPlatformStats,
  getAllReports,
  resolveReport,
  getPendingVerifications,
  submitReport,
};
