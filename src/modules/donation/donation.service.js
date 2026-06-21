const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class DonationService {
  static async createDonation(restaurantId, donationData) {
    const docRef = db.collection('donations').doc();
    const payload = {
      ...donationData,
      restaurantId,
      status: 'AVAILABLE',
      createdAt: new Date(),
      timestamps: { createdAt: new Date() }
    };
    await docRef.set(payload);
    return { id: docRef.id, ...payload };
  }

  static async getDonationById(donationId) {
    const doc = await db.collection('donations').doc(donationId).get();
    if (!doc.exists) throw new Error('Donation not found');
    return { id: doc.id, ...doc.data() };
  }

  static async getActiveDonations(filters = {}) {
    let query = db.collection('donations');
    
    // Default to available unless specified
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.restaurantId) query = query.where('restaurantId', '==', filters.restaurantId);
    if (filters.ngoId) query = query.where('ngoId', '==', filters.ngoId);
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async claimDonation(donationId, ngoId) {
    const docRef = db.collection('donations').doc(donationId);
    const doc = await docRef.get();
    
    if (!doc.exists) throw new Error('Donation not found');
    if (doc.data().status !== 'AVAILABLE') throw new Error('Donation is no longer available');

    await docRef.update({
      status: 'CLAIMED',
      ngoId,
      'timestamps.claimedAt': new Date()
    });

    return { success: true, status: 'CLAIMED' };
  }

  static async cancelDonation(donationId, restaurantId) {
    const docRef = db.collection('donations').doc(donationId);
    const doc = await docRef.get();
    
    if (!doc.exists) throw new Error('Donation not found');
    if (doc.data().restaurantId !== restaurantId) throw new Error('Unauthorized');
    if (doc.data().status !== 'AVAILABLE') throw new Error('Can only cancel unassigned donations');

    await docRef.update({
      status: 'CANCELLED',
      'timestamps.cancelledAt': new Date()
    });

    return { success: true };
  }
}
module.exports = DonationService;
