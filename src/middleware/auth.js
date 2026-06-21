const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Validates the JWT and checks if the session is still active in Firestore.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if session exists and is not revoked
    const db = getFirestore();
    const sessionDoc = await db.collection('sessions').doc(decoded.sessionId).get();
    
    if (!sessionDoc.exists) {
      return res.status(401).json({ error: 'Session expired or revoked' });
    }

    // Attach user and session to request
    req.user = {
      uid: decoded.uid,
      role: decoded.role,
      sessionId: decoded.sessionId,
      is2FAVerified: decoded.is2FAVerified || false
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Restricts route to specific roles
 * @param {string[]} allowedRoles 
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

/**
 * Requires the user to have completed 2FA for the current session
 * Primarily used for Admin routes.
 */
const require2FA = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin and Superadmin require 2FA
  if (['admin', 'superadmin'].includes(req.user.role)) {
    if (!req.user.is2FAVerified) {
      return res.status(403).json({ 
        error: '2FA Verification required', 
        code: '2FA_REQUIRED' 
      });
    }
  }
  
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  require2FA
};
