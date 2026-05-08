// server.js
const app = require('./app');
const connectDB = require('./src/config/database');
require('dotenv').config();
 
const PORT = process.env.PORT || 5000;
 
// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   UniDesk Backend Server Started       ║
╠════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}
║  Port: ${PORT}
║  URL: http://localhost:${PORT}
║  Status: Ready
╚════════════════════════════════════════╝
      `);
    });
 
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
 
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
 
startServer();