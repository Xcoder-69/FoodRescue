const service = require('./donation.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * GET /api/donations/:id
 */
const getDonationById = async (req, res) => {
  const donation = await service.getDonationById(req.params.id);
  return sendSuccess(res, { data: donation });
};

/**
 * GET /api/donations
 * Query: ?status=pending&city=Mumbai&limit=10&cursor=xxx
 */
const getAllDonations = async (req, res) => {
  const result = await service.getAllDonations(req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * POST /api/donations/:id/assign-volunteer
 * Auto-assigns nearest available volunteer
 */
const assignVolunteer = async (req, res) => {
  const result = await service.assignVolunteer(
    req.params.id,
    req.user.uid,
    req.user.role
  );
  return sendSuccess(res, {
    message: `Volunteer ${result.volunteer.name} assigned (${result.volunteer.distance} away).`,
    data: result,
  });
};

/**
 * POST /api/donations/:id/assign-volunteer/:volunteerId
 * Manually assign a specific volunteer
 */
const assignSpecificVolunteer = async (req, res) => {
  const result = await service.assignSpecificVolunteer(
    req.params.id,
    req.params.volunteerId,
    req.user.uid,
    req.user.role
  );
  return sendSuccess(res, {
    message: `Volunteer ${result.volunteer.name} manually assigned.`,
    data: result,
  });
};

/**
 * GET /api/donations/:id/track
 * Live tracking for a donation (restaurant, NGO, volunteer, admin)
 */
const getDonationTracking = async (req, res) => {
  const result = await service.getDonationTracking(
    req.params.id,
    req.user.uid,
    req.user.role
  );
  return sendSuccess(res, { data: result });
};

/**
 * POST /api/donations/expire
 * Admin only — mark overdue pending donations as expired
 */
const expireOldDonations = async (req, res) => {
  const result = await service.expireOldDonations();
  return sendSuccess(res, {
    message: `${result.expired} donation(s) marked as expired.`,
    data: result,
  });
};

/**
 * GET /api/donations/stats
 * Query: ?restaurantId=xxx OR ?ngoId=xxx
 */
const getDonationStats = async (req, res) => {
  const { restaurantId, ngoId } = req.query;
  const stats = await service.getDonationStats(restaurantId || null, ngoId || null);
  return sendSuccess(res, { data: stats });
};

module.exports = {
  getDonationById,
  getAllDonations,
  assignVolunteer,
  assignSpecificVolunteer,
  getDonationTracking,
  expireOldDonations,
  getDonationStats,
};
