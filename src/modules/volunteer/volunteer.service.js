const { db } = require('../../config/firebase');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');

const COLLECTION = 'volunteers';
const LOCATIONS_COLLECTION = 'volunteerLocations';

/**
 * Register / complete volunteer profile
 */
const registerVolunteer = async (uid, data) => {
  const existing = await db.collection(COLLECTION).doc(uid).get();
  if (existing.exists) {
    const err = new Error('Volunteer profile already exists. Use update instead.');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date();
  const volunteerData = {
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    vehicleType: data.vehicleType,
    vehicleNumber: data.vehicleNumber || null,
    isAvailable: false,
    currentLocation: null,
    totalDeliveries: 0,
    rating: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(COLLECTION).doc(uid).set(volunteerData);
  return volunteerData;
};

/**
 * Get volunteer profile by UID
 */
const getVolunteerProfile = async (uid) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Volunteer profile not found. Please complete registration.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Update volunteer profile
 */
const updateVolunteerProfile = async (uid, data) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Volunteer profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['name', 'phone', 'vehicleType', 'vehicleNumber'];
  const updates = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  await db.collection(COLLECTION).doc(uid).update(updates);
  return getVolunteerProfile(uid);
};

/**
 * Update volunteer live location
 * Writes to both volunteers (currentLocation) and volunteerLocations (live tracking)
 */
const updateLocation = async (uid, { lat, lng, heading = 0, speed = 0 }) => {
  const now = new Date();
  const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

  // Batch write for atomicity
  const batch = db.batch();

  // Update current location on volunteer profile
  batch.update(db.collection(COLLECTION).doc(uid), {
    currentLocation: location,
    updatedAt: now,
  });

  // Upsert live location document
  batch.set(db.collection(LOCATIONS_COLLECTION).doc(uid), {
    volunteerId: uid,
    location,
    heading: parseFloat(heading),
    speed: parseFloat(speed),
    isActive: true,
    updatedAt: now,
  });

  await batch.commit();
  return { location, updatedAt: now.toISOString() };
};

/**
 * Toggle volunteer availability (online/offline)
 */
const toggleAvailability = async (uid, isAvailable) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Volunteer profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const batch = db.batch();

  batch.update(db.collection(COLLECTION).doc(uid), {
    isAvailable,
    updatedAt: now,
  });

  // Mark location as inactive when going offline
  batch.set(
    db.collection(LOCATIONS_COLLECTION).doc(uid),
    { isActive: isAvailable, updatedAt: now },
    { merge: true }
  );

  await batch.commit();
  return { isAvailable, message: isAvailable ? 'You are now online.' : 'You are now offline.' };
};

/**
 * Get assigned pickup tasks for this volunteer (status: volunteer_assigned)
 */
const getMyPickups = async (uid, queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { status } = queryParams;

  const validStatuses = ['volunteer_assigned', 'picked_up'];
  const filterStatus = validStatuses.includes(status) ? status : null;

  let query = db.collection('donations')
    .where('volunteerId', '==', uid)
    .orderBy('updatedAt', 'desc');

  if (filterStatus) {
    query = db.collection('donations')
      .where('volunteerId', '==', uid)
      .where('status', '==', filterStatus)
      .orderBy('updatedAt', 'desc');
  } else {
    // Default: show active tasks only
    query = db.collection('donations')
      .where('volunteerId', '==', uid)
      .where('status', 'in', ['volunteer_assigned', 'picked_up'])
      .orderBy('updatedAt', 'desc');
  }

  return paginateQuery(query, { limit, cursor, collection: db.collection('donations') });
};

/**
 * Mark food as picked up from restaurant
 */
const markPickedUp = async (uid, donationId) => {
  const donationDoc = await db.collection('donations').doc(donationId).get();

  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = donationDoc.data();

  if (donation.volunteerId !== uid) {
    const err = new Error('This pickup is not assigned to you.');
    err.statusCode = 403;
    throw err;
  }

  if (donation.status !== 'volunteer_assigned') {
    const err = new Error(`Cannot mark pickup for donation with status: ${donation.status}`);
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  await db.collection('donations').doc(donationId).update({
    status: 'picked_up',
    pickupTime: now,
    updatedAt: now,
  });

  return { donationId, status: 'picked_up', pickupTime: now.toISOString() };
};

/**
 * Mark food as delivered to NGO
 */
const markDelivered = async (uid, donationId) => {
  const donationDoc = await db.collection('donations').doc(donationId).get();

  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = donationDoc.data();

  if (donation.volunteerId !== uid) {
    const err = new Error('This delivery is not assigned to you.');
    err.statusCode = 403;
    throw err;
  }

  if (donation.status !== 'picked_up') {
    const err = new Error(`Cannot mark delivered. Current status: ${donation.status}. Must be picked_up first.`);
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const batch = db.batch();

  // Update donation status
  batch.update(db.collection('donations').doc(donationId), {
    status: 'delivered',
    deliveryTime: now,
    updatedAt: now,
  });

  // Increment volunteer delivery count
  const volunteerDoc = await db.collection(COLLECTION).doc(uid).get();
  const currentCount = volunteerDoc.data().totalDeliveries || 0;
  batch.update(db.collection(COLLECTION).doc(uid), {
    totalDeliveries: currentCount + 1,
    updatedAt: now,
  });

  // Increment NGO received count
  if (donation.ngoId) {
    const ngoDoc = await db.collection('ngos').doc(donation.ngoId).get();
    if (ngoDoc.exists) {
      const currentReceived = ngoDoc.data().totalReceived || 0;
      batch.update(db.collection('ngos').doc(donation.ngoId), {
        totalReceived: currentReceived + 1,
        updatedAt: now,
      });
    }
  }

  await batch.commit();
  return { donationId, status: 'delivered', deliveryTime: now.toISOString() };
};

/**
 * Get completed delivery history for this volunteer
 */
const getDeliveryHistory = async (uid, queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);

  const query = db.collection('donations')
    .where('volunteerId', '==', uid)
    .where('status', '==', 'delivered')
    .orderBy('deliveryTime', 'desc');

  return paginateQuery(query, { limit, cursor, collection: db.collection('donations') });
};

/**
 * Get volunteer live location (for tracking screen)
 */
const getVolunteerLocation = async (volunteerId) => {
  const doc = await db.collection(LOCATIONS_COLLECTION).doc(volunteerId).get();
  if (!doc.exists) {
    const err = new Error('Volunteer location not available.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Get volunteer by ID (public)
 */
const getVolunteerById = async (volunteerId) => {
  const doc = await db.collection(COLLECTION).doc(volunteerId).get();
  if (!doc.exists) {
    const err = new Error('Volunteer not found.');
    err.statusCode = 404;
    throw err;
  }
  const data = doc.data();
  // Remove sensitive fields for public view
  delete data.currentLocation;
  return { id: doc.id, ...data };
};

/**
 * Find nearest available volunteers to a location
 * Used by admin/donation service to assign volunteers
 */
const findNearestVolunteers = async (lat, lng, radiusKm = 15, limit = 10) => {
  const { filterByRadius } = require('../../utils/distance');

  // Get all available volunteers with known location
  const snapshot = await db.collection(COLLECTION)
    .where('isAvailable', '==', true)
    .get();

  if (snapshot.empty) return [];

  const volunteers = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((v) => v.currentLocation !== null);

  const mapped = volunteers.map((v) => ({
    ...v,
    location: v.currentLocation, // normalize for filterByRadius
  }));

  return filterByRadius(mapped, lat, lng, radiusKm).slice(0, limit);
};

module.exports = {
  registerVolunteer,
  getVolunteerProfile,
  updateVolunteerProfile,
  updateLocation,
  toggleAvailability,
  getMyPickups,
  markPickedUp,
  markDelivered,
  getDeliveryHistory,
  getVolunteerLocation,
  getVolunteerById,
  findNearestVolunteers,
};
