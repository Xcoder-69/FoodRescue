const service = require('./restaurant.service');
const {
  sendSuccess,
  sendCreated,
  sendNotFound,
} = require('../../utils/apiResponse');

/**
 * POST /api/restaurant/register
 */
const register = async (req, res) => {
  const result = await service.registerRestaurant(req.user.uid, req.body);
  return sendCreated(res, {
    message: 'Restaurant profile created. Pending admin verification.',
    data: result,
  });
};

/**
 * GET /api/restaurant/profile
 */
const getProfile = async (req, res) => {
  const profile = await service.getRestaurantProfile(req.user.uid);
  return sendSuccess(res, { data: profile });
};

/**
 * PUT /api/restaurant/profile
 */
const updateProfile = async (req, res) => {
  const updated = await service.updateRestaurantProfile(req.user.uid, req.body);
  return sendSuccess(res, { message: 'Profile updated.', data: updated });
};

/**
 * POST /api/restaurant/profile/images
 * Multipart form: field name = "images"
 */
const uploadImages = async (req, res) => {
  const result = await service.uploadImages(req.user.uid, req.files);
  return sendSuccess(res, { message: `${req.files.length} image(s) uploaded.`, data: result });
};

/**
 * DELETE /api/restaurant/profile/images/:publicId
 */
const deleteImage = async (req, res) => {
  // publicId from Cloudinary is URL-encoded (contains slashes)
  const publicId = decodeURIComponent(req.params.publicId);
  const result = await service.deleteImage(req.user.uid, publicId);
  return sendSuccess(res, { message: 'Image deleted.', data: result });
};

/**
 * POST /api/restaurant/donations
 * Body: { foodItems, servings, expiryTime, pickupByTime, notes }
 * Files (optional): images[]
 */
const createDonation = async (req, res) => {
  const result = await service.createDonation(req.user.uid, req.body, req.files || []);
  return sendCreated(res, {
    message: 'Donation created. Nearby NGOs will be notified.',
    data: result,
  });
};

/**
 * GET /api/restaurant/donations
 * Query: ?status=pending&limit=10&cursor=xxx
 */
const getMyDonations = async (req, res) => {
  const result = await service.getMyDonations(req.user.uid, req.query);
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
 * GET /api/restaurant/donations/:id
 */
const getDonationById = async (req, res) => {
  const donation = await service.getDonationById(req.user.uid, req.params.id);
  return sendSuccess(res, { data: donation });
};

/**
 * DELETE /api/restaurant/donations/:id
 */
const cancelDonation = async (req, res) => {
  const result = await service.cancelDonation(req.user.uid, req.params.id);
  return sendSuccess(res, { message: 'Donation cancelled.', data: result });
};

/**
 * GET /api/restaurant/:id  (public — for NGOs/volunteers to view)
 */
const getRestaurantById = async (req, res) => {
  const restaurant = await service.getRestaurantById(req.params.id);
  return sendSuccess(res, { data: restaurant });
};

module.exports = {
  register,
  getProfile,
  updateProfile,
  uploadImages,
  deleteImage,
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  getRestaurantById,
};
