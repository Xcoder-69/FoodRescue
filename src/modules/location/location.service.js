const axios = require('axios');
const { getDrivingRoute, haversineDistance } = require('../../utils/distance');

// ─── OpenStreetMap Nominatim (free, no key needed) ───────────────────────────
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  'User-Agent': 'FoodRescueApp/1.0 (foodrescue@example.com)', // Required by OSM policy
  'Accept-Language': 'en',
};

// ─── OpenRouteService (free key required) ────────────────────────────────────
const ORS_BASE = 'https://api.openrouteservice.org/v2';

/**
 * Geocode: Convert address string → coordinates
 * Uses OpenStreetMap Nominatim (free, no API key)
 */
const geocodeAddress = async (address, city = '', country = 'India') => {
  const query = [address, city, country].filter(Boolean).join(', ');

  const response = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 5,
      countrycodes: 'in', // Restrict to India
    },
    headers: NOMINATIM_HEADERS,
    timeout: 8000,
  });

  if (!response.data || response.data.length === 0) {
    const err = new Error(`No results found for address: "${query}"`);
    err.statusCode = 404;
    throw err;
  }

  return response.data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
    address: {
      road: item.address?.road,
      suburb: item.address?.suburb,
      city: item.address?.city || item.address?.town || item.address?.village,
      state: item.address?.state,
      pincode: item.address?.postcode,
      country: item.address?.country,
    },
  }));
};

/**
 * Reverse Geocode: Convert coordinates → address
 * Uses OpenStreetMap Nominatim (free, no API key)
 */
const reverseGeocode = async (lat, lng) => {
  const response = await axios.get(`${NOMINATIM_BASE}/reverse`, {
    params: {
      lat,
      lon: lng,
      format: 'json',
      addressdetails: 1,
    },
    headers: NOMINATIM_HEADERS,
    timeout: 8000,
  });

  if (!response.data || response.data.error) {
    const err = new Error('Could not reverse geocode this location.');
    err.statusCode = 404;
    throw err;
  }

  const item = response.data;
  return {
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    address: {
      road: item.address?.road,
      suburb: item.address?.suburb,
      city: item.address?.city || item.address?.town || item.address?.village,
      state: item.address?.state,
      pincode: item.address?.postcode,
      country: item.address?.country,
    },
  };
};

/**
 * Get driving route between two points
 * Uses OpenRouteService. Falls back to Haversine if ORS fails.
 */
const getRoute = async (fromLat, fromLng, toLat, toLng) => {
  const route = await getDrivingRoute(fromLat, fromLng, toLat, toLng);
  return {
    from: { lat: fromLat, lng: fromLng },
    to: { lat: toLat, lng: toLng },
    distance: route.distance,
    duration: route.duration,
    unit: route.unit,
    durationText: `${route.duration} min`,
    distanceText: `${route.distance} km`,
    source: route.source,
  };
};

/**
 * Get straight-line distance between two points (fast, no API call)
 */
const getDistance = async (fromLat, fromLng, toLat, toLng) => {
  const dist = haversineDistance(fromLat, fromLng, toLat, toLng);
  const durationMins = Math.round((dist / 30) * 60); // 30 km/h assumed
  return {
    distance: dist,
    duration: durationMins,
    unit: 'km',
    durationText: `~${durationMins} min`,
    distanceText: `${dist} km`,
    method: 'haversine',
  };
};

/**
 * Distance matrix — one origin to many destinations
 * Returns distances from one point to multiple targets
 */
const getDistanceMatrix = async (originLat, originLng, destinations) => {
  if (!destinations || destinations.length === 0) {
    const err = new Error('At least one destination is required.');
    err.statusCode = 400;
    throw err;
  }

  if (destinations.length > 25) {
    const err = new Error('Maximum 25 destinations allowed per request.');
    err.statusCode = 400;
    throw err;
  }

  // Try ORS matrix API first
  try {
    const locations = [
      [parseFloat(originLng), parseFloat(originLat)], // ORS uses [lng, lat]
      ...destinations.map((d) => [parseFloat(d.lng), parseFloat(d.lat)]),
    ];

    const response = await axios.post(
      `${ORS_BASE}/matrix/driving-car`,
      {
        locations,
        sources: [0],
        destinations: destinations.map((_, i) => i + 1),
        metrics: ['distance', 'duration'],
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const distances = response.data.distances[0];
    const durations = response.data.durations[0];

    return destinations.map((dest, i) => ({
      destination: dest,
      distance: Math.round(distances[i] / 100) / 10, // meters → km
      duration: Math.round(durations[i] / 60),        // seconds → minutes
      distanceText: `${Math.round(distances[i] / 100) / 10} km`,
      durationText: `${Math.round(durations[i] / 60)} min`,
      source: 'ors',
    }));
  } catch (err) {
    // Fallback: Haversine for all destinations
    return destinations.map((dest) => {
      const dist = haversineDistance(originLat, originLng, dest.lat, dest.lng);
      const dur = Math.round((dist / 30) * 60);
      return {
        destination: dest,
        distance: dist,
        duration: dur,
        distanceText: `${dist} km`,
        durationText: `~${dur} min`,
        source: 'haversine',
      };
    });
  }
};

/**
 * Search places using OSM Nominatim autocomplete
 */
const searchPlaces = async (query, limit = 5) => {
  if (!query || query.trim().length < 3) {
    const err = new Error('Search query must be at least 3 characters.');
    err.statusCode = 400;
    throw err;
  }

  const response = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      q: `${query}, India`,
      format: 'json',
      addressdetails: 1,
      limit: Math.min(parseInt(limit), 10),
      countrycodes: 'in',
    },
    headers: NOMINATIM_HEADERS,
    timeout: 8000,
  });

  if (!response.data || response.data.length === 0) return [];

  return response.data.map((item) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    shortName: item.display_name.split(',').slice(0, 2).join(',').trim(),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
  }));
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getRoute,
  getDistance,
  getDistanceMatrix,
  searchPlaces,
};
