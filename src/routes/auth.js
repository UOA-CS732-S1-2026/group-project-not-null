// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');
 
/**
 * POST /api/auth/register
 * Register a new student or staff account
 */
router.post('/register', authController.register);
 
/**
 * POST /api/auth/login
 * Login and get access/refresh tokens
 */
router.post('/login', authController.login);
 
/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Requires: Valid JWT in Authorization header
 */
router.get('/me', verifyAuth, authController.getCurrentUser);
 
/**
 * POST /api/auth/refresh
 * Refresh an expired access token
 */
router.post('/refresh', authController.refreshToken);
 
module.exports = router;