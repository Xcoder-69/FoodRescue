const service = require('./notification.service');
const { sendSuccess, sendCreated } = require('../../utils/apiResponse');

/**
 * GET /api/notifications
 * Query: ?unreadOnly=true&limit=20&cursor=xxx
 */
const getMyNotifications = async (req, res) => {
  const result = await service.getMyNotifications(req.user.uid, req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  const count = await service.getUnreadCount(req.user.uid);
  return sendSuccess(res, { data: { unreadCount: count } });
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  const result = await service.markAsRead(req.user.uid, req.params.id);
  return sendSuccess(res, { message: 'Notification marked as read.', data: result });
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  const result = await service.markAllAsRead(req.user.uid);
  return sendSuccess(res, {
    message: `${result.updated} notification(s) marked as read.`,
    data: result,
  });
};

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  const result = await service.deleteNotification(req.user.uid, req.params.id);
  return sendSuccess(res, { message: 'Notification deleted.', data: result });
};

/**
 * POST /api/notifications/send (Admin only)
 * Send a manual push notification to a user by UID
 * Body: { recipientId, title, body, type, data? }
 */
const sendManualNotification = async (req, res) => {
  const { recipientId, title, body, type, data } = req.body;
  const result = await service.createNotification({
    recipientId,
    title,
    body,
    type: type || 'manual',
    data: data || {},
    sendPush: true,
  });
  return sendCreated(res, {
    message: 'Notification sent.',
    data: result,
  });
};

/**
 * POST /api/notifications/broadcast (Admin only)
 * Send push notification to all users of a role
 * Body: { role, title, body }
 */
const broadcastToRole = async (req, res) => {
  const { role, title, body } = req.body;
  const result = await service.sendToRole({ role, title, body });
  return sendSuccess(res, {
    message: `Broadcast sent to all ${role}s.`,
    data: result,
  });
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendManualNotification,
  broadcastToRole,
};
