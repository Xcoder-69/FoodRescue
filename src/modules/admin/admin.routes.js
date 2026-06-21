const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const { requireAuth, requireRole, require2FA } = require('../../middleware/auth');

// Apply strict security to all admin routes
router.use(requireAuth);
router.use(requireRole(['admin', 'superadmin']));
router.use(require2FA);

// 1. User Management
router.get('/approvals/:role', AdminController.getApprovals);
router.patch('/users/:uid/status', AdminController.updateUserStatus); // Body: { status: 'APPROVED' | 'BANNED' | 'SUSPENDED' }

// 2. Fraud & Security
router.get('/security/fraud-reports', AdminController.getFraudReports);
router.patch('/security/fraud-reports/:reportId/resolve', AdminController.resolveFraudReport);
router.get('/security/system-status', AdminController.getSystemStatus);

// 3. Audit Ledger
router.get('/security/audit-logs', AdminController.getAuditLogs);

// 4. Complaints
router.get('/complaints', AdminController.getComplaints);
router.patch('/complaints/:id/status', AdminController.updateComplaintStatus);

// 5. Global Sessions
router.get('/sessions/all', AdminController.getAllSessions);
router.delete('/sessions/revoke-all/:targetUid', AdminController.revokeUserSessions);

module.exports = router;
