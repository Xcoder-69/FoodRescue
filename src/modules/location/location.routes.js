const express = require('express');
const router = express.Router();
const Joi = require('joi');

const controller = require('./location.controller');
const { verifyToken } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const geocodeSchema = Joi.object({
  address: Joi.string().min(3).required().messages({
    'any.required': 'address query parameter is required.',
    'string.min': 'Address must be at least 3 characters.',
  }),
  city: Joi.string().optional(),
});

const reverseSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'any.required': 'lat is required.',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'any.required': 'lng is required.',
  }),
});

const routeSchema = Joi.object({
  fromLat: Joi.number().min(-90).max(90).required(),
  fromLng: Joi.number().min(-180).max(180).required(),
  toLat: Joi.number().min(-90).max(90).required(),
  toLng: Joi.number().min(-180).max(180).required(),
});

const searchSchema = Joi.object({
  q: Joi.string().min(3).required().messages({
    'any.required': 'Search query (q) is required.',
    'string.min': 'Query must be at least 3 characters.',
  }),
  limit: Joi.number().integer().min(1).max(10).default(5),
});

const matrixSchema = Joi.object({
  origin: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  destinations: Joi.array()
    .items(
      Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        label: Joi.string().optional(),
      })
    )
    .min(1)
    .max(25)
    .required()
    .messages({
      'array.min': 'At least 1 destination is required.',
      'array.max': 'Maximum 25 destinations per request.',
    }),
});

// ─── Routes (all require authentication) ─────────────────────────────────────

/**
 * @route   GET /api/location/geocode
 * @desc    Address string → coordinates
 * @access  Authenticated
 */
router.get(
  '/geocode',
  verifyToken,
  validate(geocodeSchema, 'query'),
  controller.geocodeAddress
);

/**
 * @route   GET /api/location/reverse
 * @desc    Coordinates → address
 * @access  Authenticated
 */
router.get(
  '/reverse',
  verifyToken,
  validate(reverseSchema, 'query'),
  controller.reverseGeocode
);

/**
 * @route   GET /api/location/route
 * @desc    Get driving route between two points (ORS or Haversine fallback)
 * @access  Authenticated
 */
router.get(
  '/route',
  verifyToken,
  validate(routeSchema, 'query'),
  controller.getRoute
);

/**
 * @route   GET /api/location/distance
 * @desc    Straight-line distance (fast, no API call)
 * @access  Authenticated
 */
router.get(
  '/distance',
  verifyToken,
  validate(routeSchema, 'query'),
  controller.getDistance
);

/**
 * @route   POST /api/location/matrix
 * @desc    Distance matrix: one origin → many destinations
 * @access  Authenticated
 */
router.post(
  '/matrix',
  verifyToken,
  validate(matrixSchema),
  controller.getDistanceMatrix
);

/**
 * @route   GET /api/location/search
 * @desc    Place autocomplete (OSM Nominatim)
 * @access  Authenticated
 */
router.get(
  '/search',
  verifyToken,
  validate(searchSchema, 'query'),
  controller.searchPlaces
);

module.exports = router;
