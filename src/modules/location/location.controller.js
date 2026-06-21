const service = require('./location.service');
const { sendSuccess, sendBadRequest } = require('../../utils/apiResponse');

/**
 * GET /api/location/geocode
 * Query: ?address=123+MG+Road&city=Mumbai
 */
const geocodeAddress = async (req, res) => {
  const { address, city } = req.query;
  const results = await service.geocodeAddress(address, city);
  return sendSuccess(res, {
    data: results,
    meta: { count: results.length },
  });
};

/**
 * GET /api/location/reverse
 * Query: ?lat=19.076&lng=72.877
 */
const reverseGeocode = async (req, res) => {
  const { lat, lng } = req.query;
  const result = await service.reverseGeocode(parseFloat(lat), parseFloat(lng));
  return sendSuccess(res, { data: result });
};

/**
 * GET /api/location/route
 * Query: ?fromLat=19.0&fromLng=72.8&toLat=19.1&toLng=72.9
 */
const getRoute = async (req, res) => {
  const { fromLat, fromLng, toLat, toLng } = req.query;
  const result = await service.getRoute(
    parseFloat(fromLat),
    parseFloat(fromLng),
    parseFloat(toLat),
    parseFloat(toLng)
  );
  return sendSuccess(res, { data: result });
};

/**
 * GET /api/location/distance
 * Query: ?fromLat=19.0&fromLng=72.8&toLat=19.1&toLng=72.9
 * (Fast straight-line — no external API)
 */
const getDistance = async (req, res) => {
  const { fromLat, fromLng, toLat, toLng } = req.query;
  const result = await service.getDistance(
    parseFloat(fromLat),
    parseFloat(fromLng),
    parseFloat(toLat),
    parseFloat(toLng)
  );
  return sendSuccess(res, { data: result });
};

/**
 * POST /api/location/matrix
 * Body: { origin: { lat, lng }, destinations: [{ lat, lng, label? }] }
 */
const getDistanceMatrix = async (req, res) => {
  const { origin, destinations } = req.body;
  const result = await service.getDistanceMatrix(
    origin.lat,
    origin.lng,
    destinations
  );
  return sendSuccess(res, {
    data: result,
    meta: { count: result.length },
  });
};

/**
 * GET /api/location/search
 * Query: ?q=Andheri+East&limit=5
 */
const searchPlaces = async (req, res) => {
  const { q, limit } = req.query;
  const results = await service.searchPlaces(q, limit);
  return sendSuccess(res, {
    data: results,
    meta: { count: results.length },
  });
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getRoute,
  getDistance,
  getDistanceMatrix,
  searchPlaces,
};
