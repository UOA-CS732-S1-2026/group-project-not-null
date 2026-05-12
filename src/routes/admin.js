const express = require('express');
const router = express.Router();
const { verifyAuth, verifyAdmin } = require('../middleware/auth');
const User = require('../models/user');

// GET /api/admin/staff/pending — list all pending staff signup requests
router.get('/staff/pending', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const pendingStaff = await User.find(
      { role: 'staff', staffStatus: 'pending' },
      '_id firstName lastName email department createdAt'
    ).sort({ createdAt: 1 });

    res.status(200).json({ staff: pendingStaff });
  } catch (error) {
    console.error('Get pending staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/staff — list all staff with optional ?status filter
router.get('/staff', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'staff' };
    if (status) filter.staffStatus = status;

    const staff = await User.find(
      filter,
      '_id firstName lastName email department staffStatus createdAt'
    ).sort({ createdAt: -1 });

    res.status(200).json({ staff });
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/staff/:id/approve — approve a pending staff account
router.patch('/staff/:id/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { staffStatus: 'active' },
      { new: true, select: '_id firstName lastName email department staffStatus' }
    );

    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.status(200).json({ message: 'Staff account approved', user });
  } catch (error) {
    console.error('Approve staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/staff/:id/reject — reject a pending staff account (sets inactive)
router.patch('/staff/:id/reject', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { staffStatus: 'inactive' },
      { new: true, select: '_id firstName lastName email department staffStatus' }
    );

    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.status(200).json({ message: 'Staff account rejected', user });
  } catch (error) {
    console.error('Reject staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/staff/:id/status — toggle active/inactive for existing staff
router.patch('/staff/:id/status', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "inactive"' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { staffStatus: status },
      { new: true, select: '_id firstName lastName email department staffStatus' }
    );

    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.status(200).json({ message: `Staff account set to ${status}`, user });
  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users — list students or admins; optional ?role=student|admin
router.get('/users', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = { role: { $in: ['student', 'admin'] } };
    if (role && ['student', 'admin'].includes(role)) filter.role = role;

    const users = await User.find(
      filter,
      '_id firstName lastName email role createdAt'
    ).sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
