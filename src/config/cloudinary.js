const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('✅ Cloudinary configured');

// ─── Multer — memory storage (buffer, then stream to Cloudinary) ─────────────

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

// Single-file upload (e.g. profile photo)
const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Multiple-file upload (e.g. restaurant images, NGO docs)
const uploadMultiple = (fieldName, maxCount = 5) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: maxCount },
    fileFilter,
  }).array(fieldName, maxCount);

// ─── Upload Helper — streams buffer to Cloudinary ───────────────────────────

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ─── Convenience upload functions ────────────────────────────────────────────

const uploadRestaurantImage = (buffer) =>
  uploadToCloudinary(buffer, {
    folder: 'foodrescue/restaurants',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  });

const uploadNgoDocument = (buffer, resourceType = 'auto') =>
  uploadToCloudinary(buffer, {
    folder: 'foodrescue/ngos',
    resource_type: resourceType,
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
  });

const uploadDonationImage = (buffer) =>
  uploadToCloudinary(buffer, {
    folder: 'foodrescue/donations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  });

const uploadProfilePhoto = (buffer) =>
  uploadToCloudinary(buffer, {
    folder: 'foodrescue/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  });

// Delete a file from Cloudinary by its public_id
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  uploadRestaurantImage,
  uploadNgoDocument,
  uploadDonationImage,
  uploadProfilePhoto,
  deleteFromCloudinary,
};
