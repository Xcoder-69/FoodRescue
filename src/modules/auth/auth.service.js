const { auth, db } = require('../../config/firebase');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a new user with email & password
 * Creates Firebase Auth user + Firestore users document
 */
const registerWithEmail = async ({ email, password, displayName, role, fcmToken }) => {
  // Validate role
  const allowedRoles = ['restaurant', 'ngo', 'volunteer'];
  if (!allowedRoles.includes(role)) {
    const err = new Error('Invalid role. Must be restaurant, ngo, or volunteer.');
    err.statusCode = 400;
    throw err;
  }

  // Check if email already exists
  try {
    await auth.getUserByEmail(email);
    const err = new Error('Email already in use.');
    err.statusCode = 409;
    throw err;
  } catch (e) {
    if (e.statusCode === 409) throw e;
    // auth/user-not-found is expected — continue
  }

  // Create Firebase Auth user
  const userRecord = await auth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });

  const now = new Date();

  // Create Firestore user document
  const userData = {
    uid: userRecord.uid,
    email,
    displayName,
    role,
    photoURL: null,
    isActive: true,
    isSuspended: false,
    fcmToken: fcmToken || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  // Set custom claims for role-based access
  await auth.setCustomUserClaims(userRecord.uid, { role });

  return {
    uid: userRecord.uid,
    email,
    displayName,
    role,
  };
};

/**
 * Verify Google ID token (sent from Android app after Google Sign-In)
 * Creates or updates user in Firestore
 */
const verifyGoogleToken = async ({ idToken, role, fcmToken }) => {
  // Verify the Google ID token using Firebase Admin
  const decoded = await auth.verifyIdToken(idToken);

  const { uid, email, name, picture } = decoded;

  // Check if user already exists in Firestore
  const userDoc = await db.collection('users').doc(uid).get();

  if (userDoc.exists) {
    // Existing user — update FCM token if provided
    const updates = { updatedAt: new Date() };
    if (fcmToken) updates.fcmToken = fcmToken;
    await db.collection('users').doc(uid).update(updates);

    const userData = userDoc.data();
    return {
      uid,
      email,
      displayName: userData.displayName || name,
      role: userData.role,
      isNewUser: false,
    };
  }

  // New user — role must be provided
  if (!role) {
    const err = new Error('Role is required for first-time Google Sign-In.');
    err.statusCode = 400;
    throw err;
  }

  const allowedRoles = ['restaurant', 'ngo', 'volunteer'];
  if (!allowedRoles.includes(role)) {
    const err = new Error('Invalid role. Must be restaurant, ngo, or volunteer.');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  // Create new Firestore user document
  const userData = {
    uid,
    email,
    displayName: name || email.split('@')[0],
    role,
    photoURL: picture || null,
    isActive: true,
    isSuspended: false,
    fcmToken: fcmToken || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').doc(uid).set(userData);

  // Set custom claims
  await auth.setCustomUserClaims(uid, { role });

  return {
    uid,
    email,
    displayName: userData.displayName,
    role,
    isNewUser: true,
  };
};

/**
 * Get user profile from Firestore
 */
const getUserProfile = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const data = userDoc.data();

  // Remove sensitive fields
  delete data.isSuspended;

  return data;
};

/**
 * Update user profile (displayName, photoURL, fcmToken)
 */
const updateUserProfile = async (uid, updates) => {
  const allowedFields = ['displayName', 'photoURL', 'fcmToken'];
  const sanitized = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    const err = new Error('No valid fields to update.');
    err.statusCode = 400;
    throw err;
  }

  sanitized.updatedAt = new Date();

  await db.collection('users').doc(uid).update(sanitized);

  // Also update Firebase Auth display name if provided
  if (sanitized.displayName || sanitized.photoURL) {
    const authUpdates = {};
    if (sanitized.displayName) authUpdates.displayName = sanitized.displayName;
    if (sanitized.photoURL) authUpdates.photoURL = sanitized.photoURL;
    await auth.updateUser(uid, authUpdates);
  }

  return getUserProfile(uid);
};

/**
 * Send password reset email via Firebase Auth
 */
const sendPasswordResetEmail = async (email) => {
  // Check user exists
  try {
    await auth.getUserByEmail(email);
  } catch (err) {
    // Don't reveal if email exists or not (security)
    return;
  }

  // Generate reset link
  const resetLink = await auth.generatePasswordResetLink(email);

  // NOTE: Firebase sends this automatically. The link is returned
  // in case you want to use a custom email service later.
  return resetLink;
};

/**
 * Update FCM token for push notifications
 */
const updateFcmToken = async (uid, fcmToken) => {
  await db.collection('users').doc(uid).update({
    fcmToken,
    updatedAt: new Date(),
  });
};

/**
 * Revoke all refresh tokens (logout)
 */
const revokeTokens = async (uid) => {
  await auth.revokeRefreshTokens(uid);
};

module.exports = {
  registerWithEmail,
  verifyGoogleToken,
  getUserProfile,
  updateUserProfile,
  sendPasswordResetEmail,
  updateFcmToken,
  revokeTokens,
};
