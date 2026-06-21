const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class RestaurantService {
  static async updateProfile(uid, profileData) {
    const ref = db.collection('restaurants').doc(uid);
    await ref.set({ ...profileData, updatedAt: new Date() }, { merge: true });
    return { success: true };
  }

  static async getProfile(uid) {
    const doc = await db.collection('restaurants').doc(uid).get();
    if (!doc.exists) throw new Error('Restaurant profile not found');
    return doc.data();
  }

  static async getDashboardStats(uid) {
    const donationsSnapshot = await db.collection('donations')
      .where('restaurantId', '==', uid).get();
    
    return {
      totalDonations: donationsSnapshot.size,
      activeDonations: donationsSnapshot.docs.filter(d => d.data().status === 'AVAILABLE').length,
      completedDonations: donationsSnapshot.docs.filter(d => d.data().status === 'DELIVERED').length
    };
  }
}
module.exports = RestaurantService;
