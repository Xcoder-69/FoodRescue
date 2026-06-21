const axios = require('axios');

/**
 * Haversine formula — calculates straight-line distance between two coordinates
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal
};

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Get driving route distance + duration using OpenRouteService
 * Falls back to haversine if ORS fails
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {number} toLat
 * @param {number} toLng
 * @returns {{ distance: number, duration: number, unit: string }}
 */
const getDrivingRoute = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const response = await axios.get(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        params: {
          api_key: process.env.ORS_API_KEY,
          start: `${fromLng},${fromLat}`,
          end: `${toLng},${toLat}`,
        },
        timeout: 5000,
      }
    );

    const route = response.data.features[0].properties.summary;
    return {
      distance: Math.round(route.distance / 100) / 10, // meters → km
      duration: Math.round(route.duration / 60),        // seconds → minutes
      unit: 'km',
      source: 'ors',
    };
  } catch (err) {
    // Fallback to haversine
    const dist = haversineDistance(fromLat, fromLng, toLat, toLng);
    return {
      distance: dist,
      duration: Math.round((dist / 30) * 60), // Assume 30 km/h avg speed
      unit: 'km',
      source: 'haversine',
    };
  }
};

/**
 * Filter and sort a list of items by distance from a reference point
 * @param {Array} items - Array of objects with location: { lat, lng }
 * @param {number} refLat - Reference latitude
 * @param {number} refLng - Reference longitude
 * @param {number} maxRadiusKm - Maximum radius in km
 * @returns {Array} Sorted by distance with distance field added
 */
const filterByRadius = (items, refLat, refLng, maxRadiusKm = 20) => {
  return items
    .map((item) => ({
      ...item,
      distance: haversineDistance(refLat, refLng, item.location.lat, item.location.lng),
    }))
    .filter((item) => item.distance <= maxRadiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = { haversineDistance, getDrivingRoute, filterByRadius };
