// src/routes/tickets.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyAuth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

router.get('/archived', verifyAuth, async (req, res) => {
  try {
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only staff or admin users can view archived tickets' });
    }

    const filter = { status: 'archived' };

    if (req.user.role === 'staff') {
      filter.assignedToStaffId = req.user.userId;
    }

    const tickets = await Ticket.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('assignedToStaffId', 'firstName lastName email')
      .sort({ resolvedAt: -1, updatedAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Get archived tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch archived tickets' });
  }
});

/**
 * POST /api/tickets
 * Create a new support ticket
 */
router.post('/', verifyAuth, ticketController.createTicket);

/**
 * GET /api/tickets
 * Get all tickets for the current student
 */
router.get('/', verifyAuth, ticketController.getStudentTickets);

/**
 * GET /api/tickets/:id
 * Get details of a specific ticket
 */
router.get('/:id', verifyAuth, ticketController.getTicketDetails);

module.exports = router;
