const { db } = require('../../config/firebase');
const { uploadNgoDocument, deleteFromCloudinary } = require('../../config/cloudinary');
const { filterByRadius } = require('../../utils/distance');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');

const COLLECTION = 'ngos';

/**
 * Register / complete NGO profile
 */
const registerNgo = async (uid, data) => {
  const existing = await db.collection(COLLECTION).doc(uid).get();
  if (existing.exists) {
    const err = new Error('NGO profile already exists. Use update instead.');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date();
  const ngoData = {
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    location: {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
    },
    registrationNumber: data.registrationNumber,
    documents: [],
    isVerified: false,
    capacity: parseInt(data.capacity) || 100,
    operatingHours: {
      open: data.openTime || '08:00',
      close: data.closeTime || '20:00',
    },
    totalReceived: 0,
    rating: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(COLLECTION).doc(uid).set(ngoData);
  return ngoData;
};

/**
 * Get NGO profile by UID
 */
const getNgoProfile = async (uid) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('NGO profile not found. Please complete registration.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Update NGO profile
 */
const updateNgoProfile = async (uid, data) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('NGO profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['name', 'phone', 'address', 'city', 'state', 'pincode', 'capacity', 'registrationNumber'];
  const updates = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  if (data.lat && data.lng) {
    updates.location = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
  }

  if (data.openTime || data.closeTime) {
    const current = doc.data().operatingHours || {};
    updates.operatingHours = {
      open: data.openTime || current.open,
      close: data.closeTime || current.close,
    };
  }

  await db.collection(COLLECTION).doc(uid).update(updates);
  return getNgoProfile(uid);
};

/**
 * Upload NGO documents (registration cert, trust deed, etc.)
 */
const uploadDocuments = async (uid, files) => {
  if (!files || files.length === 0) {
    const err = new Error('No documents provided.');
    err.statusCode = 400;
    throw err;
  }

  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('NGO profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const currentDocs = doc.data().documents || [];
  if (currentDocs.length + files.length > 10) {
    const err = new Error(`Maximum 10 documents allowed. You already have ${currentDocs.length}.`);
    err.statusCode = 400;
    throw err;
  }

  // Detect resource type (pdf vs image)
  const uploadPromises = files.map((file) => {
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    return uploadNgoDocument(file.buffer, resourceType);
  });

  const results = await Promise.all(uploadPromises);
  const newDocs = results.map((r, i) => ({
    url: r.secure_url,
    publicId: r.public_id,
    name: files[i].originalname,
    type: files[i].mimetype,
    uploadedAt: new Date().toISOString(),
  }));

  const updatedDocs = [...currentDocs, ...newDocs];
  await db.collection(COLLECTION).doc(uid).update({
    documents: updatedDocs,
    updatedAt: new Date(),
  });

  return { documents: updatedDocs };
};

/**
 * Delete an NGO document
 */
const deleteDocument = async (uid, publicId) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('NGO profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const documents = doc.data().documents || [];
  const toDelete = documents.find((d) => d.publicId === publicId);

  if (!toDelete) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }

  const resourceType = toDelete.type === 'application/pdf' ? 'raw' : 'image';
  await deleteFromCloudinary(publicId, resourceType);

  const updatedDocs = documents.filter((d) => d.publicId !== publicId);
  await db.collection(COLLECTION).doc(uid).update({
    documents: updatedDocs,
    updatedAt: new Date(),
  });

  return { documents: updatedDocs };
};

/**
 * Get nearby available donations sorted by distance
 * @param {string} uid - NGO uid
 * @param {number} radius - Radius in km (default 20)
 */
const getNearbyDonations = async (uid, { radius = 20, limit = 20 } = {}) => {
  const ngoDoc = await db.collection(COLLECTION).doc(uid).get();
  if (!ngoDoc.exists) {
    const err = new Error('NGO profile not found. Please register first.');
    err.statusCode = 404;
    throw err;
  }

  const ngo = ngoDoc.data();

  // Fetch all pending donations (Firestore doesn't support geo-queries natively)
  const snapshot = await db.collection('donations')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .limit(200) // Get a pool, then filter by distance
    .get();

  if (snapshot.empty) return [];

  const donations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    location: doc.data().restaurantLocation, // normalize for filterByRadius
  }));

  // Filter by radius using Haversine + sort by distance
  const filtered = filterByRadius(
    donations,
    ngo.location.lat,
    ngo.location.lng,
    parseFloat(radius)
  );

  return filtered.slice(0, parseInt(limit));
};

/**
 * Accept a donation — sets ngoId, changes status to 'accepted'
 */
const acceptDonation = async (uid, donationId) => {
  const ngoDoc = await db.collection(COLLECTION).doc(uid).get();
  if (!ngoDoc.exists) {
    const err = new Error('NGO profile not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!ngoDoc.data().isVerified) {
    const err = new Error('Your NGO must be verified by admin before accepting donations.');
    err.statusCode = 403;
    throw err;
  }

  const donationDoc = await db.collection('donations').doc(donationId).get();
  if (!donationDoc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = donationDoc.data();

  if (donation.status !== 'pending') {
    const err = new Error(`Cannot accept donation with status: ${donation.status}`);
    err.statusCode = 400;
    throw err;
  }

  const ngo = ngoDoc.data();
  const now = new Date();

  await db.collection('donations').doc(donationId).update({
    status: 'accepted',
    ngoId: uid,
    ngoName: ngo.name,
    ngoLocation: ngo.location,
    ngoPhone: ngo.phone,
    updatedAt: now,
  });

  return {
    donationId,
    status: 'accepted',
    message: 'Donation accepted. A volunteer will be assigned shortly.',
  };
};

/**
 * Get donations accepted by this NGO (paginated)
 */
const getMyDonations = async (uid, queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { status } = queryParams;

  let query = db.collection('donations')
    .where('ngoId', '==', uid)
    .orderBy('createdAt', 'desc');

  if (status) {
    query = db.collection('donations')
      .where('ngoId', '==', uid)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc');
  }

  return paginateQuery(query, { limit, cursor, collection: db.collection('donations') });
};

/**
 * Get NGO by ID (public)
 */
const getNgoById = async (ngoId) => {
  const doc = await db.collection(COLLECTION).doc(ngoId).get();
  if (!doc.exists) {
    const err = new Error('NGO not found.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

module.exports = {
  registerNgo,
  getNgoProfile,
  updateNgoProfile,
  uploadDocuments,
  deleteDocument,
  getNearbyDonations,
  acceptDonation,
  getMyDonations,
  getNgoById,
};
