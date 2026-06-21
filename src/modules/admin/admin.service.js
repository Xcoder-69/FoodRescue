const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class AdminService {
  
  // Helper to log all admin actions to the Immutable Audit Ledger
  static async logAudit(adminId, action, targetId, ipAddress, details = {}) {
    await db.collection('security').doc('logs').collection('auditLogs').add({
      adminId,
      action,
      targetId,
      ipAddress: ipAddress || 'Unknown',
      details,
      timestamp: new Date()
    });
  }

  // 1. User Management & Approvals
  static async getApprovals(role) {
    const snapshot = await db.collection('users')
      .where('role', '==', role)
      .where('status', '==', 'PENDING')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateUserStatus(adminUid, targetUid, newStatus, ipAddress) {
    const userRef = db.collection('users').doc(targetUid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) throw new Error('User not found');
    
    await userRef.update({ 
      status: newStatus, 
      updatedAt: new Date() 
    });

    // If banned or suspended, instantly nuke all their active sessions
    if (newStatus === 'BANNED' || newStatus === 'SUSPENDED') {
      await this.revokeAllUserSessions(adminUid, targetUid, ipAddress, true);
    }

    await this.logAudit(adminUid, `UPDATED_STATUS_TO_${newStatus}`, targetUid, ipAddress, { oldStatus: userDoc.data().status });
    
    return { success: true, status: newStatus };
  }

  // 2. Fraud Intelligence & Security
  static async getFraudReports() {
    const snapshot = await db.collection('security').doc('logs').collection('fraudReports')
      .where('status', '==', 'OPEN')
      .orderBy('riskScore', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async resolveFraudReport(adminUid, reportId, ipAddress) {
    const reportRef = db.collection('security').doc('logs').collection('fraudReports').doc(reportId);
    await reportRef.update({ status: 'RESOLVED', resolvedAt: new Date(), resolvedBy: adminUid });
    await this.logAudit(adminUid, 'RESOLVED_FRAUD_REPORT', reportId, ipAddress);
    return { success: true };
  }

  static async getSystemStatus() {
    // Overview of bans, open fraud reports, etc.
    const usersSnapshot = await db.collection('users').where('status', '==', 'BANNED').count().get();
    const fraudSnapshot = await db.collection('security').doc('logs').collection('fraudReports').where('status', '==', 'OPEN').count().get();
    
    return {
      totalBannedUsers: usersSnapshot.data().count,
      openFraudReports: fraudSnapshot.data().count,
      systemHealth: 'OPERATIONAL'
    };
  }

  // 3. Immutable Audit Ledger
  static async getAuditLogs(limit = 100) {
    const snapshot = await db.collection('security').doc('logs').collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 4. Complaints Management
  static async getComplaints() {
    const snapshot = await db.collection('complaints')
      .where('status', 'in', ['OPEN', 'INVESTIGATING'])
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateComplaintStatus(adminUid, complaintId, newStatus, ipAddress) {
    const complaintRef = db.collection('complaints').doc(complaintId);
    await complaintRef.update({ status: newStatus, updatedAt: new Date() });
    await this.logAudit(adminUid, `UPDATED_COMPLAINT_TO_${newStatus}`, complaintId, ipAddress);
    return { success: true };
  }

  // 5. Global Session Control
  static async getAllSessions() {
    const snapshot = await db.collection('sessions').limit(200).get(); // Limit for safety
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async revokeAllUserSessions(adminUid, targetUid, ipAddress, isAutoRevoke = false) {
    const sessionsSnapshot = await db.collection('sessions').where('userId', '==', targetUid).get();
    
    const batch = db.batch();
    sessionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    if (!isAutoRevoke) {
       await this.logAudit(adminUid, 'REVOKED_ALL_USER_SESSIONS', targetUid, ipAddress);
    }
    
    return { success: true, sessionsTerminated: sessionsSnapshot.size };
  }
}

module.exports = AdminService;
