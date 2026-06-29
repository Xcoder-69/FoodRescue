require('dotenv').config();
require('express-async-errors');

const http = require('http');
require('./src/config/firebase'); // Initialize Firebase before loading routes
const app = require('./src/app');
const initSocket = require('./src/socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io); // Make socket available inside express routes if needed

// Start Nightly Analytics Cron
const startAggregator = require('./src/cron/analyticsAggregator');
startAggregator();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 FoodRescue API Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}/api\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = server;
