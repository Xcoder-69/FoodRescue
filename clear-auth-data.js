/**
 * clear-auth-data.js
 * Deletes ALL documents from: users, sessions, otps collections.
 * Run with: node clear-auth-data.js
 */

const { db } = require('./src/config/firebase');

async function deleteCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`  ⚠️  [${collectionName}] is already empty.`);
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  ✅  [${collectionName}] — deleted ${snapshot.size} document(s).`);
  return snapshot.size;
}

async function clearAllAuthData() {
  console.log('\n🗑️  CLEARING ALL REGISTRATION & LOGIN DATA FROM FIREBASE FIRESTORE');
  console.log('='.repeat(65));

  try {
    const collections = ['users', 'sessions', 'otps'];
    let total = 0;

    for (const col of collections) {
      process.stdout.write(`\n  Clearing [${col}]... `);
      const count = await deleteCollection(col);
      total += count;
    }

    console.log('\n' + '='.repeat(65));
    console.log(`🎉  Done! Total documents deleted: ${total}`);
    console.log('='.repeat(65) + '\n');
  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

clearAllAuthData();
