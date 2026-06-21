const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class NgoService {
  static async updateProfile(uid, profileData) {
    const ref = db.collection('ngos').doc(uid);
    await ref.set({ ...profileData, updatedAt: new Date() }, { merge: true });
    return { success: true };
  }

  static async getProfile(uid) {
    const doc = await db.collection('ngos').doc(uid).get();
    if (!doc.exists) throw new Error('NGO profile not found');
    return doc.data();
  }

  static async getDashboardStats(uid) {
    const donationsSnapshot = await db.collection('donations').where('ngoId', '==', uid).get();
    return {
      totalClaimed: donationsSnapshot.size,
      activeDeliveries: donationsSnapshot.docs.filter(d => d.data().status === 'IN_TRANSIT').length
    };
  }
}
module.exports = NgoService;
