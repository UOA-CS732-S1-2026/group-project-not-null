// app.js - CORRECT VERSION
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
 
dotenv.config();
 
const app = express();
 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
 
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});
 
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tickets', require('./src/routes/tickets'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/admin', require('./src/routes/admin'));
 
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
 
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages });
  }
 
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }
 
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
 
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
 
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error'
  });
});
 
module.exports = app;