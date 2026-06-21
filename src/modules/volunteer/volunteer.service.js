const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class VolunteerService {
  static async updateProfile(uid, profileData) {
    const ref = db.collection('volunteers').doc(uid);
    await ref.set({ ...profileData, updatedAt: new Date() }, { merge: true });
    return { success: true };
  }

  static async getProfile(uid) {
    const doc = await db.collection('volunteers').doc(uid).get();
    if (!doc.exists) throw new Error('Volunteer profile not found');
    return doc.data();
  }

  static async getDashboardStats(uid) {
    const deliveriesSnapshot = await db.collection('deliveries').where('volunteerId', '==', uid).get();
    return {
      completedDeliveries: deliveriesSnapshot.docs.filter(d => d.data().status === 'DELIVERED').length,
      activeDelivery: deliveriesSnapshot.docs.find(d => d.data().status !== 'DELIVERED')?.data() || null
    };
  }
}
module.exports = VolunteerService;
