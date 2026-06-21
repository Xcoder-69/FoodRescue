const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class ComplaintService {
  static async fileComplaint(uid, complaintData) {
    const docRef = db.collection('complaints').doc();
    const payload = {
      ...complaintData,
      filedBy: uid,
      status: 'OPEN',
      createdAt: new Date()
    };
    await docRef.set(payload);
    return { id: docRef.id, ...payload };
  }

  static async getUserComplaints(uid) {
    const snapshot = await db.collection('complaints').where('filedBy', '==', uid).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
module.exports = ComplaintService;
