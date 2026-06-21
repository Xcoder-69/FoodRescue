const Joi = require('joi');
const { sendBadRequest } = require('../../utils/apiResponse');

/**
 * Validates request payload against Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // Crucial for preventing NoSQL injection via unknown object properties
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      return sendBadRequest(res, 'Validation failed', errors);
    }

    req.body = value; // Replace req.body with strictly typed and stripped object
    next();
  };
};

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().max(100),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('restaurant', 'ngo', 'volunteer', 'admin').default('volunteer'),
    adminSecretCode: Joi.string().allow('', null).optional(),
    deviceId: Joi.string().max(255).allow('', null).optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().max(100),
    password: Joi.string().required().max(128),
    deviceId: Joi.string().max(255).allow('', null).optional()
  }),

  google: Joi.object({
    idToken: Joi.string().required(),
    role: Joi.string().valid('restaurant', 'ngo', 'volunteer').default('volunteer'),
    deviceId: Joi.string().max(255).allow('', null).optional()
  }),

  verify2FA: Joi.object({
    token: Joi.string().length(6).pattern(/^[0-9]+$/).required()
  })
};

module.exports = {
  validate,
  authSchemas
};
