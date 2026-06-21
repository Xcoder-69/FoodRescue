const authService = require('./auth.service');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
} = require('../../utils/apiResponse');

/**
 * POST /api/auth/register
 * Register new user with email/password
 * Body: { email, password, displayName, role, fcmToken? }
 */
const register = async (req, res) => {
  const { email, password, displayName, role, fcmToken } = req.body;

  const result = await authService.registerWithEmail({
    email,
    password,
    displayName,
    role,
    fcmToken,
  });

  return sendCreated(res, {
    message: 'Account created successfully. Please login with your credentials.',
    data: result,
  });
};

/**
 * POST /api/auth/google
 * Verify Google Sign-In ID token from Android
 * Body: { idToken, role?, fcmToken? }
 * - idToken: Firebase ID token received after Google Sign-In on Android
 * - role: Required only for first-time sign-in
 */
const googleSignIn = async (req, res) => {
  const { idToken, role, fcmToken } = req.body;

  const result = await authService.verifyGoogleToken({ idToken, role, fcmToken });

  return sendSuccess(res, {
    message: result.isNewUser ? 'Account created via Google.' : 'Google Sign-In successful.',
    data: result,
  });
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Requires: Authorization Bearer token
 */
const getMe = async (req, res) => {
  const profile = await authService.getUserProfile(req.user.uid);

  return sendSuccess(res, {
    message: 'Profile fetched successfully.',
    data: profile,
  });
};

/**
 * PUT /api/auth/me
 * Update current user's profile
 * Body: { displayName?, photoURL?, fcmToken? }
 */
const updateMe = async (req, res) => {
  const updated = await authService.updateUserProfile(req.user.uid, req.body);

  return sendSuccess(res, {
    message: 'Profile updated successfully.',
    data: updated,
  });
};

/**
 * POST /api/auth/reset-password
 * Send password reset email
 * Body: { email }
 */
const resetPassword = async (req, res) => {
  const { email } = req.body;

  await authService.sendPasswordResetEmail(email);

  // Always return success to prevent email enumeration
  return sendSuccess(res, {
    message: 'If this email is registered, a password reset link has been sent.',
  });
};

/**
 * PUT /api/auth/fcm-token
 * Update FCM token for push notifications
 * Body: { fcmToken }
 */
const updateFcmToken = async (req, res) => {
  const { fcmToken } = req.body;

  await authService.updateFcmToken(req.user.uid, fcmToken);

  return sendSuccess(res, {
    message: 'FCM token updated successfully.',
  });
};

/**
 * POST /api/auth/logout
 * Revoke all refresh tokens
 */
const logout = async (req, res) => {
  await authService.revokeTokens(req.user.uid);

  return sendSuccess(res, {
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  googleSignIn,
  getMe,
  updateMe,
  resetPassword,
  updateFcmToken,
  logout,
};
