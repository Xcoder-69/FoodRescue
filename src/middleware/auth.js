const { auth, db } = require('../config/firebase');
const { sendUnauthorized, sendForbidden } = require('../utils/apiResponse');

/**
 * Verify Firebase ID token from Authorization header
 * Attaches decoded user to req.user
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'No token provided. Include Authorization: Bearer <token>');
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    
    // Get user role from Firestore users collection
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return sendUnauthorized(res, 'User account not found');
    }

    const userData = userDoc.data();

    if (userData.isSuspended) {
      return sendForbidden(res, 'Your account has been suspended. Contact support.');
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData.role,
      displayName: userData.displayName,
      isActive: userData.isActive,
    };

    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return sendUnauthorized(res, 'Token expired. Please login again.');
    }
    if (err.code === 'auth/argument-error') {
      return sendUnauthorized(res, 'Invalid token format.');
    }
    return sendUnauthorized(res, 'Authentication failed.');
  }
};

/**
 * Role-based access control middleware factory
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'restaurant')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
