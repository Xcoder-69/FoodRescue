const service = require('./volunteer.service');
const { sendSuccess, sendCreated } = require('../../utils/apiResponse');

/**
 * POST /api/volunteer/register
 */
const register = async (req, res) => {
  const result = await service.registerVolunteer(req.user.uid, req.body);
  return sendCreated(res, {
    message: 'Volunteer profile created. Toggle availability to start receiving pickups.',
    data: result,
  });
};

/**
 * GET /api/volunteer/profile
 */
const getProfile = async (req, res) => {
  const profile = await service.getVolunteerProfile(req.user.uid);
  return sendSuccess(res, { data: profile });
};

/**
 * PUT /api/volunteer/profile
 */
const updateProfile = async (req, res) => {
  const updated = await service.updateVolunteerProfile(req.user.uid, req.body);
  return sendSuccess(res, { message: 'Profile updated.', data: updated });
};

/**
 * POST /api/volunteer/location
 * Body: { lat, lng, heading?, speed? }
 */
const updateLocation = async (req, res) => {
  const { lat, lng, heading, speed } = req.body;
  const result = await service.updateLocation(req.user.uid, { lat, lng, heading, speed });
  return sendSuccess(res, { message: 'Location updated.', data: result });
};

/**
 * PUT /api/volunteer/availability
 * Body: { isAvailable: true/false }
 */
const toggleAvailability = async (req, res) => {
  const { isAvailable } = req.body;
  const result = await service.toggleAvailability(req.user.uid, isAvailable);
  return sendSuccess(res, { message: result.message, data: { isAvailable: result.isAvailable } });
};

/**
 * GET /api/volunteer/pickups
 * Query: ?status=volunteer_assigned&limit=10
 */
const getMyPickups = async (req, res) => {
  const result = await service.getMyPickups(req.user.uid, req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * POST /api/volunteer/pickups/:id/pickup
 * Mark food as picked up from restaurant
 */
const markPickedUp = async (req, res) => {
  const result = await service.markPickedUp(req.user.uid, req.params.id);
  return sendSuccess(res, { message: 'Food picked up. Head to the NGO for delivery.', data: result });
};

/**
 * POST /api/volunteer/pickups/:id/deliver
 * Mark food as delivered to NGO
 */
const markDelivered = async (req, res) => {
  const result = await service.markDelivered(req.user.uid, req.params.id);
  return sendSuccess(res, { message: '🎉 Delivery complete! Thank you for rescuing food.', data: result });
};

/**
 * GET /api/volunteer/history
 * Query: ?limit=10&cursor=xxx
 */
const getDeliveryHistory = async (req, res) => {
  const result = await service.getDeliveryHistory(req.user.uid, req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: {
      count: result.count,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    },
  });
};

/**
 * GET /api/volunteer/:id/location
 * Get live location of a specific volunteer (for tracking)
 */
const getVolunteerLocation = async (req, res) => {
  const location = await service.getVolunteerLocation(req.params.id);
  return sendSuccess(res, { data: location });
};

/**
 * GET /api/volunteer/:id
 * Public volunteer profile
 */
const getVolunteerById = async (req, res) => {
  const volunteer = await service.getVolunteerById(req.params.id);
  return sendSuccess(res, { data: volunteer });
};

module.exports = {
  register,
  getProfile,
  updateProfile,
  updateLocation,
  toggleAvailability,
  getMyPickups,
  markPickedUp,
  markDelivered,
  getDeliveryHistory,
  getVolunteerLocation,
  getVolunteerById,
};
