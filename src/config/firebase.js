const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

let serviceAccount;

try {
  // Try loading from file (local development)
  serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));
} catch (err) {
  // In production (Railway/Render), load from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    console.error('❌ Firebase service account not found!');
    console.error('   Place serviceAccountKey.json in root OR set FIREBASE_SERVICE_ACCOUNT env var');
    process.exit(1);
  }
}

// Initialize only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log('✅ Firebase Admin SDK initialized');
}

const db = getFirestore();
const auth = getAuth();
const messaging = getMessaging();

// Firestore settings
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db, auth, messaging };

