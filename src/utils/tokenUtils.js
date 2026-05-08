// src/utils/tokenUtils.js
const jwt = require('jsonwebtoken');
 
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';  // Default 7 days
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';
 
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
 
/**
 * Create a JWT access token
 * @param {Object} payload - Data to encode in token
 * @returns {String} Signed JWT token
 */
const createAccessToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error creating token:', error);
    throw new Error('Failed to create token');
  }
};
 
/**
 * Create a refresh token (longer expiry)
 * @param {Object} payload - Data to encode in token
 * @returns {String} Signed JWT refresh token
 */
const createRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error creating refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
};
 
/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};
 
/**
 * Decode token without verification (useful for checking expiry)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};
 
/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
 
  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
    expiresIn: JWT_EXPIRY
  };
};
 
module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  decodeToken,
  generateTokenPair
};