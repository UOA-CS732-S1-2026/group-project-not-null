const express = require('express');
const router = express.Router();
const { verifyAuth, verifyAdmin } = require('../middleware/auth');
const User = require('../models/user');
const Ticket = require('../models/Ticket');
const { serializeTicketWithAttachment } = require('../services/ticketAttachmentService');

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

// PATCH /api/admin/staff/:id/promote — promote active staff to admin
router.patch('/staff/:id/promote', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff', staffStatus: 'active' },
      { role: 'admin', $unset: { staffStatus: 1 } },
      { new: true, select: '_id firstName lastName email role' }
    );

    if (!user) {
      return res.status(404).json({ error: 'Active staff member not found' });
    }

    res.status(200).json({ message: 'Staff promoted to admin', user });
  } catch (error) {
    console.error('Promote staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/tickets — list all tickets with optional filters
router.get('/tickets', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { ticketNumber: re }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('studentId', 'firstName lastName email')
        .populate('assignedToStaffId', 'firstName lastName email')
        .sort({ priority: 1, updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Ticket.countDocuments(filter),
    ]);
    res.status(200).json({ tickets, total });
  } catch (error) {
    console.error('Get admin tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/tickets/:id/assign — assign or unassign a ticket
router.patch('/tickets/:id/assign', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { staffId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedToStaffId: staffId || null, updatedAt: new Date() },
      { new: true }
    ).populate('assignedToStaffId', 'firstName lastName email');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.status(200).json({ ticket: serializeTicketWithAttachment(ticket) });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
