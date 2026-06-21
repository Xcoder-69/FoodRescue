const AuthService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

class AuthController {
  
  static async register(req, res) {
    try {
      const { email, password, role, adminSecretCode, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await AuthService.register(email, password, role, adminSecretCode, ipAddress, deviceId);
      return successResponse(res, 201, 'Registration successful', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async login(req, res) {
    try {
      const { email, password, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await AuthService.login(email, password, ipAddress, deviceId);
      return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  static async googleLogin(req, res) {
    try {
      const { idToken, role, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await AuthService.googleLogin(idToken, role, ipAddress, deviceId);
      return successResponse(res, 200, 'Google Login successful', result);
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  static async setup2FA(req, res) {
    try {
      const uid = req.user.uid;
      const result = await AuthService.setup2FA(uid);
      return successResponse(res, 200, '2FA setup initiated', result);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async verify2FASetup(req, res) {
    try {
      const { token } = req.body;
      const uid = req.user.uid;
      await AuthService.verify2FASetup(uid, token);
      return successResponse(res, 200, '2FA successfully enabled');
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async verify2FALogin(req, res) {
    try {
      const { token } = req.body;
      const { uid, sessionId } = req.user; // User already authenticated via JWT but needs 2FA clearance
      
      const tokens = await AuthService.verify2FALogin(uid, sessionId, token);
      return successResponse(res, 200, '2FA verified successfully', { tokens });
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      return successResponse(res, 200, 'Tokens refreshed', { tokens });
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  static async logout(req, res) {
    try {
      const { sessionId } = req.user;
      await AuthService.logout(sessionId);
      return successResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getSessions(req, res) {
      try {
          const sessions = await AuthService.getActiveSessions(req.user.uid);
          return successResponse(res, 200, 'Active sessions retrieved', { sessions });
      } catch (error) {
          return errorResponse(res, 400, error.message);
      }
  }

  static async revokeSession(req, res) {
      try {
          const { sessionId } = req.params;
          await AuthService.revokeSession(req.user.uid, sessionId);
          return successResponse(res, 200, 'Session revoked');
      } catch (error) {
          return errorResponse(res, 400, error.message);
      }
  }
}

module.exports = AuthController;
