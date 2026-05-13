// src/config/database.js
const mongoose = require('mongoose');
 
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    console.log(`✓ MongoDB database: unidesk`);
    
    return conn;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
 
// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});
 
mongoose.connection.on('error', (error) => {
  console.error('✗ MongoDB error:', error.message);
});
 
module.exports = connectDB;
