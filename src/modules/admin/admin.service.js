const { auth, db } = require('../../config/firebase');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');
const notificationService = require('../notification/notification.service');

// ─── User Management ─────────────────────────────────────────────────────────

/**
 * Get all users with optional role filter and search (paginated)
 */
const getAllUsers = async (queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { role, search } = queryParams;

  let query = db.collection('users').orderBy('createdAt', 'desc');
  if (role) query = db.collection('users').where('role', '==', role).orderBy('createdAt', 'desc');

  const result = await paginateQuery(query, { limit, cursor, collection: db.collection('users') });

  // Apply search filter in-memory (Firestore doesn't support full-text search)
  if (search) {
    const term = search.toLowerCase();
    result.data = result.data.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }

  return result;
};

/**
 * Get a single user by UID with their profile (restaurant/NGO/volunteer)
 */
const getUserDetails = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const user = { id: userDoc.id, ...userDoc.data() };

  // Fetch role-specific profile
  let profile = null;
  try {
    if (user.role === 'restaurant') {
      const doc = await db.collection('restaurants').doc(uid).get();
      if (doc.exists) profile = doc.data();
    } else if (user.role === 'ngo') {
      const doc = await db.collection('ngos').doc(uid).get();
      if (doc.exists) profile = doc.data();
    } else if (user.role === 'volunteer') {
      const doc = await db.collection('volunteers').doc(uid).get();
      if (doc.exists) profile = doc.data();
    }
  } catch (_) {}

  return { user, profile };
};

/**
 * Verify an NGO or Restaurant account
 */
const verifyAccount = async (uid, adminUid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const user = userDoc.data();
  const verifiableRoles = ['restaurant', 'ngo'];

  if (!verifiableRoles.includes(user.role)) {
    const err = new Error(`Cannot verify users with role: ${user.role}. Only restaurant and NGO accounts can be verified.`);
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const batch = db.batch();

  // Update user's isVerified in their role collection
  batch.update(
    db.collection(user.role === 'restaurant' ? 'restaurants' : 'ngos').doc(uid),
    { isVerified: true, verifiedAt: now, verifiedBy: adminUid, updatedAt: now }
  );

  // Send notification
  const orgDoc = await db.collection(user.role === 'restaurant' ? 'restaurants' : 'ngos').doc(uid).get();
  const orgName = orgDoc.exists ? orgDoc.data().name : user.displayName;

  await batch.commit();

  // Notify the user
  await notificationService.createNotification({
    recipientId: uid,
    ...notificationService.templates.accountVerified(orgName),
    sendPush: true,
  });

  return { uid, isVerified: true, verifiedAt: now.toISOString() };
};

/**
 * Suspend a user account
 */
const suspendUser = async (uid, reason, adminUid) => {
  if (uid === adminUid) {
    const err = new Error('Admin cannot suspend their own account.');
    err.statusCode = 400;
    throw err;
  }

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  await db.collection('users').doc(uid).update({
    isSuspended: true,
    suspendedAt: now,
    suspensionReason: reason || 'Violation of terms of service.',
    suspendedBy: adminUid,
    updatedAt: now,
  });

  // Revoke Firebase Auth tokens (force logout)
  await auth.revokeRefreshTokens(uid);

  // Notify user
  await notificationService.createNotification({
    recipientId: uid,
    ...notificationService.templates.accountSuspended(reason),
    sendPush: true,
  });

  return { uid, isSuspended: true, reason };
};

/**
 * Unsuspend / reinstate a user account
 */
const unsuspendUser = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  await db.collection('users').doc(uid).update({
    isSuspended: false,
    suspendedAt: null,
    suspensionReason: null,
    suspendedBy: null,
    updatedAt: new Date(),
  });

  return { uid, isSuspended: false };
};

/**
 * Delete a user permanently (Firebase Auth + Firestore + role profile)
 */
const deleteUser = async (uid, adminUid) => {
  if (uid === adminUid) {
    const err = new Error('Admin cannot delete their own account.');
    err.statusCode = 400;
    throw err;
  }

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const user = userDoc.data();

  // Delete from Firebase Auth
  await auth.deleteUser(uid);

  const batch = db.batch();

  // Delete user doc
  batch.delete(db.collection('users').doc(uid));

  // Delete role profile
  if (user.role === 'restaurant') batch.delete(db.collection('restaurants').doc(uid));
  if (user.role === 'ngo') batch.delete(db.collection('ngos').doc(uid));
  if (user.role === 'volunteer') {
    batch.delete(db.collection('volunteers').doc(uid));
    batch.delete(db.collection('volunteerLocations').doc(uid));
  }

  await batch.commit();

  return { uid, deleted: true };
};

/**
 * Promote a user to admin role
 */
const promoteToAdmin = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  await db.collection('users').doc(uid).update({
    role: 'admin',
    updatedAt: new Date(),
  });

  // Update Firebase Auth custom claims
  await auth.setCustomUserClaims(uid, { role: 'admin' });

  return { uid, role: 'admin' };
};

// ─── Platform Stats ──────────────────────────────────────────────────────────

/**
 * Get comprehensive platform statistics
 */
const getPlatformStats = async () => {
  const [
    totalUsers,
    restaurants,
    ngos,
    volunteers,
    totalDonations,
    pendingDonations,
    deliveredDonations,
    cancelledDonations,
  ] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('restaurants').count().get(),
    db.collection('ngos').count().get(),
    db.collection('volunteers').count().get(),
    db.collection('donations').count().get(),
    db.collection('donations').where('status', '==', 'pending').count().get(),
    db.collection('donations').where('status', '==', 'delivered').count().get(),
    db.collection('donations').where('status', '==', 'cancelled').count().get(),
  ]);

  const [verifiedRestaurants, verifiedNgos, activeVolunteers, suspendedUsers] = await Promise.all([
    db.collection('restaurants').where('isVerified', '==', true).count().get(),
    db.collection('ngos').where('isVerified', '==', true).count().get(),
    db.collection('volunteers').where('isAvailable', '==', true).count().get(),
    db.collection('users').where('isSuspended', '==', true).count().get(),
  ]);

  return {
    users: {
      total: totalUsers.data().count,
      restaurants: restaurants.data().count,
      ngos: ngos.data().count,
      volunteers: volunteers.data().count,
      suspended: suspendedUsers.data().count,
      verifiedRestaurants: verifiedRestaurants.data().count,
      verifiedNgos: verifiedNgos.data().count,
      activeVolunteers: activeVolunteers.data().count,
    },
    donations: {
      total: totalDonations.data().count,
      pending: pendingDonations.data().count,
      delivered: deliveredDonations.data().count,
      cancelled: cancelledDonations.data().count,
      successRate: totalDonations.data().count
        ? Math.round((deliveredDonations.data().count / totalDonations.data().count) * 100)
        : 0,
    },
  };
};

// ─── Reports / Complaints ────────────────────────────────────────────────────

/**
 * Submit a report/complaint about a user or donation
 */
const submitReport = async (reporterId, data) => {
  const now = new Date();
  const report = {
    reporterId,
    reportedEntityId: data.reportedEntityId,
    entityType: data.entityType,
    reason: data.reason,
    description: data.description || '',
    status: 'pending',
    adminNote: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection('reports').add(report);
  return { id: docRef.id, ...report };
};

/**
 * Get all reports (Admin only, paginated)
 */
const getAllReports = async (queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { status } = queryParams;

  let query = db.collection('reports').orderBy('createdAt', 'desc');
  if (status) query = db.collection('reports').where('status', '==', status).orderBy('createdAt', 'desc');

  return paginateQuery(query, { limit, cursor, collection: db.collection('reports') });
};

/**
 * Resolve a report
 */
const resolveReport = async (reportId, adminNote, action) => {
  const doc = await db.collection('reports').doc(reportId).get();
  if (!doc.exists) {
    const err = new Error('Report not found.');
    err.statusCode = 404;
    throw err;
  }

  await db.collection('reports').doc(reportId).update({
    status: 'resolved',
    adminNote: adminNote || '',
    action: action || 'none',
    resolvedAt: new Date(),
    updatedAt: new Date(),
  });

  return { id: reportId, status: 'resolved' };
};

/**
 * Get unverified NGOs/Restaurants pending verification
 */
const getPendingVerifications = async (role) => {
  const collection = role === 'ngo' ? 'ngos' : 'restaurants';
  const snapshot = await db.collection(collection)
    .where('isVerified', '==', false)
    .orderBy('createdAt', 'asc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  getAllUsers,
  getUserDetails,
  verifyAccount,
  suspendUser,
  unsuspendUser,
  deleteUser,
  promoteToAdmin,
  getPlatformStats,
  submitReport,
  getAllReports,
  resolveReport,
  getPendingVerifications,
};
