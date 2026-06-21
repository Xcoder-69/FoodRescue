const { messaging, db } = require('../../config/firebase');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');

const COLLECTION = 'notifications';

// ─── FCM Push Notification Senders ──────────────────────────────────────────

/**
 * Send push notification to a single device by FCM token
 */
const sendToDevice = async ({ token, title, body, data = {} }) => {
  if (!token) return { skipped: true, reason: 'No FCM token' };

  const message = {
    token,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
  };

  try {
    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (err) {
    if (err.code === 'messaging/registration-token-not-registered') {
      return { success: false, reason: 'Token expired or invalid' };
    }
    throw err;
  }
};

/**
 * Send push to multiple devices (multicast, max 500 per call)
 */
const sendToMultipleDevices = async ({ tokens, title, body, data = {} }) => {
  const validTokens = tokens.filter(Boolean);
  if (validTokens.length === 0) return { success: 0, failure: 0 };

  const message = {
    tokens: validTokens,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
  };

  const response = await messaging.sendEachForMulticast(message);
  return {
    success: response.successCount,
    failure: response.failureCount,
    total: validTokens.length,
  };
};

/**
 * Send to all users of a specific role using FCM topic
 * Android app must subscribe to: /topics/role_restaurant, /topics/role_ngo etc.
 */
const sendToRole = async ({ role, title, body, data = {} }) => {
  const topic = `role_${role}`;
  const message = {
    topic,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: { sound: 'default' },
    },
  };

  const response = await messaging.send(message);
  return { success: true, topic, messageId: response };
};

// ─── In-App Notification Storage ────────────────────────────────────────────

/**
 * Create an in-app notification in Firestore (+ optionally send FCM push)
 */
const createNotification = async ({
  recipientId,
  title,
  body,
  type,
  data = {},
  sendPush = true,
}) => {
  const now = new Date();

  const notification = {
    recipientId,
    title,
    body,
    type,
    data,
    isRead: false,
    createdAt: now,
  };

  // Store in Firestore
  const docRef = await db.collection(COLLECTION).add(notification);

  // Send FCM push if requested
  if (sendPush) {
    try {
      const userDoc = await db.collection('users').doc(recipientId).get();
      if (userDoc.exists && userDoc.data().fcmToken) {
        await sendToDevice({
          token: userDoc.data().fcmToken,
          title,
          body,
          data: { ...data, notificationId: docRef.id, type },
        });
      }
    } catch (pushErr) {
      // Push failure should not fail the notification save
      console.error('FCM push failed (non-fatal):', pushErr.message);
    }
  }

  return { id: docRef.id, ...notification };
};

/**
 * Bulk create notifications for multiple recipients (e.g. notify all nearby NGOs)
 */
const createBulkNotifications = async (recipients, { title, body, type, data = {} }) => {
  const now = new Date();
  const batch = db.batch();

  const notifications = recipients.map((recipientId) => {
    const ref = db.collection(COLLECTION).doc();
    const notif = {
      recipientId,
      title,
      body,
      type,
      data,
      isRead: false,
      createdAt: now,
    };
    batch.set(ref, notif);
    return { id: ref.id, ...notif };
  });

  await batch.commit();

  // Send FCM push to all recipients in background
  try {
    const userDocs = await Promise.all(
      recipients.map((uid) => db.collection('users').doc(uid).get())
    );
    const tokens = userDocs
      .filter((d) => d.exists && d.data().fcmToken)
      .map((d) => d.data().fcmToken);

    if (tokens.length > 0) {
      await sendToMultipleDevices({ tokens, title, body, data });
    }
  } catch (err) {
    console.error('Bulk FCM push failed (non-fatal):', err.message);
  }

  return { count: notifications.length, notifications };
};

// ─── Notification Retrieval ──────────────────────────────────────────────────

/**
 * Get notifications for the current user (paginated)
 */
const getMyNotifications = async (uid, queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { unreadOnly } = queryParams;

  let query = db.collection(COLLECTION)
    .where('recipientId', '==', uid)
    .orderBy('createdAt', 'desc');

  if (unreadOnly === 'true') {
    query = db.collection(COLLECTION)
      .where('recipientId', '==', uid)
      .where('isRead', '==', false)
      .orderBy('createdAt', 'desc');
  }

  return paginateQuery(query, { limit, cursor, collection: db.collection(COLLECTION) });
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (uid) => {
  const snap = await db.collection(COLLECTION)
    .where('recipientId', '==', uid)
    .where('isRead', '==', false)
    .count()
    .get();

  return snap.data().count;
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (uid, notificationId) => {
  const doc = await db.collection(COLLECTION).doc(notificationId).get();

  if (!doc.exists) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    throw err;
  }

  if (doc.data().recipientId !== uid) {
    const err = new Error('Not authorized to update this notification.');
    err.statusCode = 403;
    throw err;
  }

  await db.collection(COLLECTION).doc(notificationId).update({
    isRead: true,
    readAt: new Date(),
  });

  return { id: notificationId, isRead: true };
};

/**
 * Mark all notifications as read for the current user
 */
const markAllAsRead = async (uid) => {
  const snapshot = await db.collection(COLLECTION)
    .where('recipientId', '==', uid)
    .where('isRead', '==', false)
    .limit(100)
    .get();

  if (snapshot.empty) return { updated: 0 };

  const batch = db.batch();
  const now = new Date();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true, readAt: now });
  });

  await batch.commit();
  return { updated: snapshot.size };
};

/**
 * Delete a notification
 */
const deleteNotification = async (uid, notificationId) => {
  const doc = await db.collection(COLLECTION).doc(notificationId).get();

  if (!doc.exists) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    throw err;
  }

  if (doc.data().recipientId !== uid) {
    const err = new Error('Not authorized to delete this notification.');
    err.statusCode = 403;
    throw err;
  }

  await db.collection(COLLECTION).doc(notificationId).delete();
  return { id: notificationId, deleted: true };
};

// ─── Pre-built Notification Templates ───────────────────────────────────────

const templates = {
  donationCreated: (donation) => ({
    title: '🍱 New Food Donation Available!',
    body: `${donation.restaurantName} has listed food near you. ${donation.servings} servings available.`,
    type: 'donation_created',
    data: { donationId: donation.id, restaurantCity: donation.restaurantCity },
  }),

  donationAccepted: (donation, ngoName) => ({
    title: '✅ Donation Accepted',
    body: `${ngoName} has accepted your food donation. A volunteer will be assigned shortly.`,
    type: 'donation_accepted',
    data: { donationId: donation.id },
  }),

  volunteerAssigned: (donation) => ({
    title: '🚴 Volunteer Assigned',
    body: `${donation.volunteerName} is on the way to pick up the donation.`,
    type: 'volunteer_assigned',
    data: { donationId: donation.id, volunteerId: donation.volunteerId },
  }),

  foodPickedUp: (donation) => ({
    title: '📦 Food Picked Up',
    body: `${donation.volunteerName} has picked up the food and is heading to ${donation.ngoName}.`,
    type: 'food_picked_up',
    data: { donationId: donation.id },
  }),

  foodDelivered: (donation) => ({
    title: '🎉 Food Delivered!',
    body: `Food has been successfully delivered to ${donation.ngoName}. Thank you!`,
    type: 'food_delivered',
    data: { donationId: donation.id },
  }),

  accountVerified: (orgName) => ({
    title: '✅ Account Verified',
    body: `Congratulations! Your account "${orgName}" has been verified by admin.`,
    type: 'account_verified',
    data: {},
  }),

  accountSuspended: (reason) => ({
    title: '⚠️ Account Suspended',
    body: reason || 'Your account has been suspended. Please contact support.',
    type: 'account_suspended',
    data: {},
  }),
};

module.exports = {
  sendToDevice,
  sendToMultipleDevices,
  sendToRole,
  createNotification,
  createBulkNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  templates,
};
