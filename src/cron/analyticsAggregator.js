const cron = require('node-cron');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

/**
 * Runs every night at midnight (00:00) to aggregate daily statistics.
 * This saves us from running slow COUNT() queries on millions of rows.
 */
const startAggregator = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running Nightly Analytics Aggregator...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(today);
    endOfYesterday.setHours(0, 0, 0, 0);

    // Get Daily New Users
    const usersSnapshot = await db.collection('users')
      .where('createdAt', '>=', yesterday)
      .where('createdAt', '<', endOfYesterday)
      .get();

    // Get Daily Completed Donations
    const donationsSnapshot = await db.collection('donations')
      .where('status', '==', 'DELIVERED')
      .where('timestamps.completedAt', '>=', yesterday)
      .where('timestamps.completedAt', '<', endOfYesterday)
      .get();

    let dailyFoodKg = 0;
    donationsSnapshot.forEach(doc => {
      const data = doc.data();
      dailyFoodKg += (data.foodDetails?.quantity || 0);
    });

    const dateKey = yesterday.toISOString().split('T')[0];

    // Write to Daily Trends
    await db.collection('analytics').doc('platform_daily').collection('trends').doc(dateKey).set({
      newUsersRegistered: usersSnapshot.size,
      foodDonatedKg: dailyFoodKg,
      mealsDelivered: donationsSnapshot.size,
    });

    // Update Global Lifetime Stats
    const globalRef = db.collection('analytics').doc('platform_global');
    await db.runTransaction(async (transaction) => {
      const globalDoc = await transaction.get(globalRef);
      const data = globalDoc.exists ? globalDoc.data() : { totalFoodSavedKg: 0, totalMealsDelivered: 0, totalActiveUsers: 0 };
      
      transaction.set(globalRef, {
        totalFoodSavedKg: data.totalFoodSavedKg + dailyFoodKg,
        totalMealsDelivered: data.totalMealsDelivered + donationsSnapshot.size,
        totalActiveUsers: data.totalActiveUsers + usersSnapshot.size, // Note: better logic required to track churn
        updatedAt: new Date()
      }, { merge: true });
    });

    console.log(`✅ Analytics aggregated for ${dateKey}`);
  });
};

module.exports = startAggregator;
