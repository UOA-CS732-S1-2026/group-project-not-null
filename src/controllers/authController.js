// src/controllers/authController.js
const User = require('../models/user');
const { generateTokenPair } = require('../utils/tokenUtils');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Please provide all required fields: email, password, firstName, lastName'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const validRoles = ['student', 'staff'];
    const userRole = role || 'student';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        error: 'Invalid role. Must be "student" or "staff"'
      });
    }

    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
      firstName,
      lastName,
      role: userRole,
      department: userRole === 'staff' ? department : undefined
    });

    await user.save();

    const tokens = generateTokenPair(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      ...tokens
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: error.message || 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'This account has been deactivated'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const tokens = generateTokenPair(user);

    res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: error.message || 'Login failed'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const { verifyToken } = require('../utils/tokenUtils');
    const decoded = verifyToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const newTokens = generateTokenPair(user);

    res.status(200).json({
      message: 'Token refreshed',
      ...newTokens
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: error.message || 'Token refresh failed'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken
};
