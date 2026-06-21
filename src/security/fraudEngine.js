const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

class FraudEngine {
  
  /**
   * Generates a fraud report in Firestore for Admin review.
   */
  static async createReport(entityId, entityType, reason, riskScore) {
    await db.collection('security').doc('logs').collection('fraudReports').add({
      entityId,
      entityType,
      reason,
      riskScore,
      status: 'OPEN',
      timestamp: new Date()
    });
  }

  /**
   * Analyzes a new registration attempt.
   * Checks for duplicates and IP velocity.
   */
  static async analyzeRegistration(email, phone, ipAddress, deviceId) {
    let riskScore = 0;
    const reasons = [];

    // 1. IP / Device Velocity Check (Score: 90)
    if (ipAddress || deviceId) {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      let velocityQuery = db.collection('sessions').where('createdAt', '>=', tenMinsAgo);
      
      const recentSessions = await velocityQuery.get();
      const ipMatches = recentSessions.docs.filter(d => d.data().ipAddress === ipAddress).length;
      const deviceMatches = recentSessions.docs.filter(d => d.data().deviceId === deviceId).length;

      if (ipMatches >= 3 || deviceMatches >= 3) {
        riskScore += 90;
        reasons.push('HIGH_VELOCITY_SPAM_RING');
      }
    }

    // 2. Duplicate Check (If phone is provided)
    if (phone) {
      const phoneCheck = await db.collection('users').where('phone', '==', phone).limit(1).get();
      if (!phoneCheck.empty) {
        riskScore += 100;
        reasons.push('DUPLICATE_PHONE');
      }
    }

    // Determine Action
    if (riskScore >= 100) {
      await this.createReport(email, 'registration', reasons.join(', '), riskScore);
      throw new Error('Registration blocked due to severe security policy violation.');
    } else if (riskScore >= 80) {
      await this.createReport(email, 'registration', reasons.join(', '), riskScore);
      // Let it pass but the account will be heavily flagged (implementation detail: status could be locked)
    }

    return { riskScore, passed: true };
  }

  /**
   * Analyzes behavior of a user (e.g. cancellations).
   */
  static async logCancellation(uid, role) {
    // Basic implementation: fetch user, increment cancel count
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const data = userDoc.data();
      const cancelCount = (data.cancelCount || 0) + 1;
      let riskScore = (data.riskScore || 0) + 20;

      await userRef.update({ cancelCount, riskScore });

      if (riskScore >= 80) {
        await this.createReport(uid, 'user', 'EXCESSIVE_CANCELLATIONS', riskScore);
        
        // Auto-suspend
        await userRef.update({ status: 'SUSPENDED' });
        
        // Revoke all sessions (Calling AdminService logic conceptually)
        const sessionsSnapshot = await db.collection('sessions').where('userId', '==', uid).get();
        const batch = db.batch();
        sessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
    }
  }

  /**
   * Analyzes document hashes to detect reused FSSAI or PAN cards.
   */
  static async checkDocumentHash(uid, docHash) {
    const existing = await db.collection('documents').where('hash', '==', docHash).limit(1).get();
    if (!existing.empty) {
      await this.createReport(uid, 'document', 'DUPLICATE_DOCUMENT_HASH', 85);
    } else {
      // Save hash for future checks
      await db.collection('documents').add({ hash: docHash, uploadedBy: uid, timestamp: new Date() });
    }
  }
}

module.exports = FraudEngine;
