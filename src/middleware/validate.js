const Joi = require('joi');
const { sendBadRequest } = require('../utils/apiResponse');

/**
 * Joi validation middleware factory
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {'body'|'query'|'params'} source - Which part of request to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,  // Return all errors, not just first
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return sendBadRequest(res, 'Validation failed', errors);
    }

    req[source] = value; // Replace with sanitized value
    next();
  };
};

// ─── Common Joi Schemas ──────────────────────────────────────────────────────

const schemas = {
  // Location
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }),

  // Pagination
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10),
    cursor: Joi.string().optional(),
  }),

  // Phone number (Indian format)
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({ 'string.pattern.base': 'Invalid Indian phone number (10 digits starting with 6-9)' }),
};

module.exports = { validate, schemas };
