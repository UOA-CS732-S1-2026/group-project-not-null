const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

router.get('/tickets', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff can view all tickets' });
    }

    const tickets = await Ticket.find()
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All tickets retrieved',
      tickets,
      total: tickets.length
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/tickets/:id', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff can update tickets' });
    }

    const { status, assignedToStaffId } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedToStaffId) updateData.assignedToStaffId = assignedToStaffId;
    updateData.updatedAt = new Date();

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    )
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/tickets/:id/notes', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff can add notes' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Note content required' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          internalNotes: {
            staffId: req.user.userId,
            content,
            createdAt: new Date()
          }
        },
        updatedAt: new Date()
      },
      { returnDocument: 'after' }
    )
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName')
      .populate('internalNotes.staffId', 'email firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Note added successfully',
      ticket
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/summary', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff can view analytics' });
    }

    const tickets = await Ticket.find();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in_progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });

    const ticketsByCategory = {};
    tickets.forEach(ticket => {
      ticketsByCategory[ticket.category] = (ticketsByCategory[ticket.category] || 0) + 1;
    });

    const ticketsByUrgency = {};
    tickets.forEach(ticket => {
      ticketsByUrgency[ticket.urgencyLevel] = (ticketsByUrgency[ticket.urgencyLevel] || 0) + 1;
    });

    res.status(200).json({
      totalTickets: tickets.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      ticketsByCategory,
      ticketsByUrgency,
      averageResolutionTime: 'N/A'
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;