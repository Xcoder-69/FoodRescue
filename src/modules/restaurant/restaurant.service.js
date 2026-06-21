const { db } = require('../../config/firebase');
const { uploadRestaurantImage, deleteFromCloudinary } = require('../../config/cloudinary');
const { paginateQuery, getPaginationParams } = require('../../utils/pagination');

const COLLECTION = 'restaurants';

/**
 * Register / complete restaurant profile
 */
const registerRestaurant = async (uid, data) => {
  const existing = await db.collection(COLLECTION).doc(uid).get();
  if (existing.exists) {
    const err = new Error('Restaurant profile already exists. Use update instead.');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date();
  const restaurantData = {
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
    images: [],
    licenseNumber: data.licenseNumber || null,
    fssaiNumber: data.fssaiNumber || null,
    isVerified: false,
    totalDonations: 0,
    rating: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(COLLECTION).doc(uid).set(restaurantData);
  return restaurantData;
};

/**
 * Get restaurant profile by UID
 */
const getRestaurantProfile = async (uid) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Restaurant profile not found. Please complete registration.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Update restaurant profile fields
 */
const updateRestaurantProfile = async (uid, data) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Restaurant profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['name', 'phone', 'address', 'city', 'state', 'pincode', 'licenseNumber', 'fssaiNumber'];
  const updates = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  // Update location if provided
  if (data.lat && data.lng) {
    updates.location = {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
    };
  }

  await db.collection(COLLECTION).doc(uid).update(updates);
  return getRestaurantProfile(uid);
};

/**
 * Upload images to Cloudinary and save URLs to Firestore
 */
const uploadImages = async (uid, files) => {
  if (!files || files.length === 0) {
    const err = new Error('No images provided.');
    err.statusCode = 400;
    throw err;
  }

  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Restaurant profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const currentImages = doc.data().images || [];
  if (currentImages.length + files.length > 8) {
    const err = new Error(`Maximum 8 images allowed. You already have ${currentImages.length}.`);
    err.statusCode = 400;
    throw err;
  }

  // Upload all files to Cloudinary
  const uploadPromises = files.map((file) => uploadRestaurantImage(file.buffer));
  const results = await Promise.all(uploadPromises);

  const newUrls = results.map((r) => ({
    url: r.secure_url,
    publicId: r.public_id,
  }));

  const updatedImages = [...currentImages, ...newUrls];
  await db.collection(COLLECTION).doc(uid).update({
    images: updatedImages,
    updatedAt: new Date(),
  });

  return { images: updatedImages };
};

/**
 * Delete an image by publicId
 */
const deleteImage = async (uid, publicId) => {
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) {
    const err = new Error('Restaurant profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const images = doc.data().images || [];
  const imageToDelete = images.find((img) => img.publicId === publicId);

  if (!imageToDelete) {
    const err = new Error('Image not found.');
    err.statusCode = 404;
    throw err;
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(publicId);

  // Remove from Firestore
  const updatedImages = images.filter((img) => img.publicId !== publicId);
  await db.collection(COLLECTION).doc(uid).update({
    images: updatedImages,
    updatedAt: new Date(),
  });

  return { images: updatedImages };
};

/**
 * Create a food donation request
 */
const createDonation = async (uid, data, imageFiles = []) => {
  // Get restaurant info
  const restaurantDoc = await db.collection(COLLECTION).doc(uid).get();
  if (!restaurantDoc.exists) {
    const err = new Error('Complete your restaurant registration before creating donations.');
    err.statusCode = 403;
    throw err;
  }

  const restaurant = restaurantDoc.data();

  // Upload food images if provided
  let donationImages = [];
  if (imageFiles && imageFiles.length > 0) {
    const { uploadDonationImage } = require('../../config/cloudinary');
    const uploadPromises = imageFiles.map((f) => uploadDonationImage(f.buffer));
    const results = await Promise.all(uploadPromises);
    donationImages = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const now = new Date();
  const pickupByTime = new Date(data.pickupByTime);
  const expiryTime = new Date(data.expiryTime);

  if (pickupByTime <= now) {
    const err = new Error('Pickup time must be in the future.');
    err.statusCode = 400;
    throw err;
  }

  const donationData = {
    restaurantId: uid,
    restaurantName: restaurant.name,
    restaurantLocation: restaurant.location,
    restaurantAddress: restaurant.address,
    restaurantCity: restaurant.city,
    restaurantPhone: restaurant.phone,
    foodItems: data.foodItems,
    servings: parseInt(data.servings),
    expiryTime,
    pickupByTime,
    status: 'pending',
    ngoId: null,
    ngoName: null,
    ngoLocation: null,
    volunteerId: null,
    volunteerName: null,
    volunteerPhone: null,
    images: donationImages,
    notes: data.notes || '',
    pickupTime: null,
    deliveryTime: null,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection('donations').add(donationData);

  // Increment restaurant donation count
  await db.collection(COLLECTION).doc(uid).update({
    totalDonations: (restaurant.totalDonations || 0) + 1,
    updatedAt: now,
  });

  return { id: docRef.id, ...donationData };
};

/**
 * Get donation list for a restaurant (paginated)
 */
const getMyDonations = async (uid, queryParams) => {
  const { limit, cursor } = getPaginationParams(queryParams);
  const { status } = queryParams;

  let query = db.collection('donations')
    .where('restaurantId', '==', uid)
    .orderBy('createdAt', 'desc');

  if (status) {
    query = db.collection('donations')
      .where('restaurantId', '==', uid)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc');
  }

  return paginateQuery(query, { limit, cursor, collection: db.collection('donations') });
};

/**
 * Get a single donation by ID (restaurant must own it)
 */
const getDonationById = async (uid, donationId) => {
  const doc = await db.collection('donations').doc(donationId).get();

  if (!doc.exists) {
    const err = new Error('Donation not found.');
    err.statusCode = 404;
    throw err;
  }

  const donation = { id: doc.id, ...doc.data() };

  if (donation.restaurantId !== uid) {
    const err = new Error('Access denied. This donation does not belong to your restaurant.');
    err.statusCode = 403;
    throw err;
  }

  return donation;
};

/**
 * Cancel a pending donation
 */
const cancelDonation = async (uid, donationId) => {
  const donation = await getDonationById(uid, donationId);

  const cancellableStatuses = ['pending', 'accepted'];
  if (!cancellableStatuses.includes(donation.status)) {
    const err = new Error(`Cannot cancel a donation with status: ${donation.status}`);
    err.statusCode = 400;
    throw err;
  }

  await db.collection('donations').doc(donationId).update({
    status: 'cancelled',
    updatedAt: new Date(),
  });

  return { id: donationId, status: 'cancelled' };
};

/**
 * Get restaurant by ID (public)
 */
const getRestaurantById = async (restaurantId) => {
  const doc = await db.collection(COLLECTION).doc(restaurantId).get();
  if (!doc.exists) {
    const err = new Error('Restaurant not found.');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
};

module.exports = {
  registerRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  uploadImages,
  deleteImage,
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  getRestaurantById,
};
