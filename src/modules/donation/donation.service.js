const { db } = require('../../config/firebase');
const { findNearestVolunteers } = require('../volunteer/volunteer.service');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');

const COLLECTION = 'donations';

/**
 * Get a single donation by ID (any authenticated user)
 */
const getDonationById = async (donationId) => {
  const doc = await db.collection(COLLECTION).doc(donationId).get();
  if (!doc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Get all donations with filters (paginated)
 * Used by: NGO browse, Admin dashboard
 */
const getAllDonations = async (queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { status, city, restaurantId, ngoId } = queryParams;

  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

  // Firestore only allows one inequality filter, so we chain equality filters
  if (status) query = query.where('status', '==', status);
  if (city) query = query.where('restaurantCity', '==', city);
  if (restaurantId) query = query.where('restaurantId', '==', restaurantId);
  if (ngoId) query = query.where('ngoId', '==', ngoId);

  return paginateQuery(query, { limit, cursor, collection: db.collection(COLLECTION) });
};

/**
 * Assign nearest available volunteer to an accepted donation
 * Called after NGO accepts a donation
 */
const assignVolunteer = async (donationId, requesterId, requesterRole) => {
  const donationDoc = await db.collection(COLLECTION).doc(donationId).get();

  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = donationDoc.data();

  // Only admin or the NGO that accepted can assign volunteer
  if (requesterRole !== 'admin' && donation.ngoId !== requesterId) {
    const err = new Error('Only the accepting NGO or admin can assign a volunteer.');
    err.statusCode = 403;
    throw err;
  }

  if (donation.status !== 'accepted') {
    const err = new Error(`Volunteer can only be assigned to accepted donations. Current: ${donation.status}`);
    err.statusCode = 400;
    throw err;
  }

  if (!donation.restaurantLocation) {
    const err = new Error('Restaurant location not found on donation. Cannot find nearest volunteer.');
    err.statusCode = 400;
    throw err;
  }

  // Find nearest available volunteer to the restaurant
  const volunteers = await findNearestVolunteers(
    donation.restaurantLocation.lat,
    donation.restaurantLocation.lng,
    15, // 15km radius
    5   // Top 5 nearest
  );

  if (volunteers.length === 0) {
    const err = new Error('No available volunteers found nearby. Please try again later.');
    err.statusCode = 503;
    throw err;
  }

  // Assign the nearest one
  const assignedVolunteer = volunteers[0];
  const now = new Date();

  await db.collection(COLLECTION).doc(donationId).update({
    status: 'volunteer_assigned',
    volunteerId: assignedVolunteer.id,
    volunteerName: assignedVolunteer.name,
    volunteerPhone: assignedVolunteer.phone,
    updatedAt: now,
  });

  return {
    donationId,
    volunteer: {
      id: assignedVolunteer.id,
      name: assignedVolunteer.name,
      phone: assignedVolunteer.phone,
      distance: `${assignedVolunteer.distance} km`,
      vehicleType: assignedVolunteer.vehicleType,
    },
    status: 'volunteer_assigned',
  };
};

/**
 * Manually assign a specific volunteer (by admin or NGO)
 */
const assignSpecificVolunteer = async (donationId, volunteerId, requesterId, requesterRole) => {
  const [donationDoc, volunteerDoc] = await Promise.all([
    db.collection(COLLECTION).doc(donationId).get(),
    db.collection('volunteers').doc(volunteerId).get(),
  ]);

  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!volunteerDoc.exists) {
    const err = new Error('Volunteer not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = donationDoc.data();
  const volunteer = volunteerDoc.data();

  if (requesterRole !== 'admin' && donation.ngoId !== requesterId) {
    const err = new Error('Only the accepting NGO or admin can assign a volunteer.');
    err.statusCode = 403;
    throw err;
  }

  if (donation.status !== 'accepted') {
    const err = new Error(`Cannot assign volunteer. Donation status: ${donation.status}`);
    err.statusCode = 400;
    throw err;
  }

  if (!volunteer.isAvailable) {
    const err = new Error('Selected volunteer is not currently available.');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  await db.collection(COLLECTION).doc(donationId).update({
    status: 'volunteer_assigned',
    volunteerId,
    volunteerName: volunteer.name,
    volunteerPhone: volunteer.phone,
    updatedAt: now,
  });

  return {
    donationId,
    volunteer: { id: volunteerId, name: volunteer.name, phone: volunteer.phone },
    status: 'volunteer_assigned',
  };
};

/**
 * Get live status of a donation (for tracking screen)
 * Returns full donation + volunteer location if in transit
 */
const getDonationTracking = async (donationId, requesterId, requesterRole) => {
  const donationDoc = await db.collection(COLLECTION).doc(donationId).get();

  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = { id: donationDoc.id, ...donationDoc.data() };

  // Only involved parties can track
  const isInvolved =
    requesterRole === 'admin' ||
    donation.restaurantId === requesterId ||
    donation.ngoId === requesterId ||
    donation.volunteerId === requesterId;

  if (!isInvolved) {
    const err = new Error('You are not authorized to track this donation.');
    err.statusCode = 403;
    throw err;
  }

  let volunteerLocation = null;
  if (
    donation.volunteerId &&
    ['volunteer_assigned', 'picked_up'].includes(donation.status)
  ) {
    try {
      const locDoc = await db.collection('volunteerLocations').doc(donation.volunteerId).get();
      if (locDoc.exists) {
        volunteerLocation = locDoc.data();
      }
    } catch (_) {
      // Location not available — not fatal
    }
  }

  return { donation, volunteerLocation };
};

/**
 * Mark expired donations — run periodically or on-demand by admin
 * Sets status to 'expired' for past-pickup-deadline pending donations
 */
const expireOldDonations = async () => {
  const now = new Date();

  const snapshot = await db.collection(COLLECTION)
    .where('status', '==', 'pending')
    .where('pickupByTime', '<=', now)
    .limit(100)
    .get();

  if (snapshot.empty) return { expired: 0 };

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: 'expired', updatedAt: now });
  });

  await batch.commit();
  return { expired: snapshot.size };
};

/**
 * Get donation stats summary (for dashboards)
 */
const getDonationStats = async (restaurantId = null, ngoId = null) => {
  const statuses = ['pending', 'accepted', 'volunteer_assigned', 'picked_up', 'delivered', 'cancelled', 'expired'];
  const stats = {};

  // Build base query
  const getCount = async (status) => {
    let q = db.collection(COLLECTION).where('status', '==', status);
    if (restaurantId) q = q.where('restaurantId', '==', restaurantId);
    if (ngoId) q = q.where('ngoId', '==', ngoId);
    const snap = await q.count().get();
    return snap.data().count;
  };

  await Promise.all(
    statuses.map(async (s) => {
      stats[s] = await getCount(s);
    })
  );

  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  return stats;
};

module.exports = {
  getDonationById,
  getAllDonations,
  assignVolunteer,
  assignSpecificVolunteer,
  getDonationTracking,
  expireOldDonations,
  getDonationStats,
};
