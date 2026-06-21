const service = require('./ngo.service');
const { sendSuccess, sendCreated } = require('../../utils/apiResponse');

/**
 * POST /api/ngo/register
 */
const register = async (req, res) => {
  const result = await service.registerNgo(req.user.uid, req.body);
  return sendCreated(res, {
    message: 'NGO profile created. Upload your documents for admin verification.',
    data: result,
  });
};

/**
 * GET /api/ngo/profile
 */
const getProfile = async (req, res) => {
  const profile = await service.getNgoProfile(req.user.uid);
  return sendSuccess(res, { data: profile });
};

/**
 * PUT /api/ngo/profile
 */
const updateProfile = async (req, res) => {
  const updated = await service.updateNgoProfile(req.user.uid, req.body);
  return sendSuccess(res, { message: 'Profile updated.', data: updated });
};

/**
 * POST /api/ngo/profile/documents
 * Multipart: field = "documents", max 5 files
 */
const uploadDocuments = async (req, res) => {
  const result = await service.uploadDocuments(req.user.uid, req.files);
  return sendSuccess(res, {
    message: `${req.files.length} document(s) uploaded.`,
    data: result,
  });
};

/**
 * DELETE /api/ngo/profile/documents/:publicId
 */
const deleteDocument = async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);
  const result = await service.deleteDocument(req.user.uid, publicId);
  return sendSuccess(res, { message: 'Document deleted.', data: result });
};

/**
 * GET /api/ngo/donations/nearby
 * Query: ?radius=20&limit=20
 */
const getNearbyDonations = async (req, res) => {
  const { radius = 20, limit = 20 } = req.query;
  const donations = await service.getNearbyDonations(req.user.uid, {
    radius: parseFloat(radius),
    limit: parseInt(limit),
  });
  return sendSuccess(res, {
    data: donations,
    meta: { count: donations.length, radius: `${radius} km` },
  });
};

/**
 * POST /api/ngo/donations/:id/accept
 */
const acceptDonation = async (req, res) => {
  const result = await service.acceptDonation(req.user.uid, req.params.id);
  return sendSuccess(res, { message: result.message, data: result });
};

/**
 * GET /api/ngo/donations
 * Query: ?status=accepted&limit=10&cursor=xxx
 */
const getMyDonations = async (req, res) => {
  const result = await service.getMyDonations(req.user.uid, req.query);
  return sendSuccess(res, {
    data: result.data,
    meta: { count: result.count, hasMore: result.hasMore, nextCursor: result.nextCursor },
  });
};

/**
 * GET /api/ngo/:id  (public)
 */
const getNgoById = async (req, res) => {
  const ngo = await service.getNgoById(req.params.id);
  return sendSuccess(res, { data: ngo });
};

module.exports = {
  register,
  getProfile,
  updateProfile,
  uploadDocuments,
  deleteDocument,
  getNearbyDonations,
  acceptDonation,
  getMyDonations,
  getNgoById,
};
