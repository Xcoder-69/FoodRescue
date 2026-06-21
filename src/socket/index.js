const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('Authentication error');
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded; // { uid, role, sessionId }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.uid})`);

    // Volunteers emit location updates
    socket.on('volunteer:updateLocation', async (data) => {
      if (socket.user.role !== 'volunteer') return;
      
      const { deliveryId, lat, lng } = data;
      
      // Persist to Firestore
      await db.collection('volunteers').doc(socket.user.uid).update({
        currentLocation: new (require('firebase-admin/firestore').GeoPoint)(lat, lng),
        lastActive: new Date()
      });

      // Broadcast to specific delivery room
      if (deliveryId) {
        socket.to(`delivery_${deliveryId}`).emit('delivery:locationUpdate', {
          deliveryId,
          lat,
          lng,
          timestamp: Date.now()
        });
      }
    });

    // Join a delivery room to track it (used by NGOs and Restaurants)
    socket.on('track:joinDelivery', (deliveryId) => {
      // In a real app, you'd query Firestore here to ensure this user has rights to track this delivery
      const room = `delivery_${deliveryId}`;
      socket.join(room);
      console.log(`User ${socket.user.uid} joined tracking room: ${room}`);
    });

    // Leave a delivery room
    socket.on('track:leaveDelivery', (deliveryId) => {
      const room = `delivery_${deliveryId}`;
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
