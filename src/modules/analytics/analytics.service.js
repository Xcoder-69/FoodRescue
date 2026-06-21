const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class AnalyticsService {
  /**
   * Fetches the global platform statistics (Total Meals, Total Users)
   */
  static async getPlatformStats() {
    const doc = await db.collection('analytics').doc('platform_global').get();
    if (!doc.exists) {
      return { totalFoodSavedKg: 0, totalMealsDelivered: 0, totalActiveUsers: 0, totalCO2Offset: 0 };
    }
    return doc.data();
  }

  /**
   * Fetches historical trend data for the last N days
   */
  static async getDailyTrends(days = 7) {
    const snapshot = await db.collection('analytics').doc('platform_daily').collection('trends')
      .orderBy('date', 'desc')
      .limit(days)
      .get();
    
    return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() })).reverse();
  }
}
module.exports = AnalyticsService;
