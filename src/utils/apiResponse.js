/**
 * Standard API response helper
 * Ensures consistent response format across all endpoints
 */

const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendError = (res, { statusCode = 500, message = 'Internal Server Error', errors = null }) => {
  const response = {
    success: false,
    message,
  };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { message = 'Created successfully', data = null }) => {
  return sendSuccess(res, { statusCode: 201, message, data });
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, { statusCode: 404, message });
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, { statusCode: 401, message });
};

const sendForbidden = (res, message = 'Forbidden. You do not have permission.') => {
  return sendError(res, { statusCode: 403, message });
};

const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, { statusCode: 400, message, errors });
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
};
