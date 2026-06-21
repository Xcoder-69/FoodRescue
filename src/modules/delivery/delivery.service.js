const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class DeliveryService {
  static async getAvailableDeliveries() {
    const snapshot = await db.collection('donations')
      .where('status', '==', 'CLAIMED')
      .where('volunteerId', '==', null)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async acceptDelivery(donationId, volunteerId) {
    const ref = db.collection('donations').doc(donationId);
    const doc = await ref.get();
    if (!doc.exists) throw new Error('Donation not found');
    if (doc.data().status !== 'CLAIMED') throw new Error('Donation not claimable for delivery');
    if (doc.data().volunteerId) throw new Error('Already assigned to a volunteer');
    await ref.update({ volunteerId, status: 'IN_TRANSIT', 'timestamps.acceptedAt': new Date() });
    return { success: true };
  }

  static async updateDeliveryStatus(donationId, volunteerId, newStatus) {
    const ref = db.collection('donations').doc(donationId);
    const doc = await ref.get();
    if (!doc.exists) throw new Error('Donation not found');
    if (doc.data().volunteerId !== volunteerId) throw new Error('Unauthorized');
    const validStatuses = ['PICKED_UP', 'EN_ROUTE', 'DELIVERED'];
    if (!validStatuses.includes(newStatus)) throw new Error(`Invalid status. Must be: ${validStatuses.join(', ')}`);
    
    const updateData = { status: newStatus };
    if (newStatus === 'DELIVERED') updateData['timestamps.completedAt'] = new Date();
    await ref.update(updateData);
    return { success: true, status: newStatus };
  }
}
module.exports = DeliveryService;
