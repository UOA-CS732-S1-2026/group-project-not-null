// src/routes/tickets.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyAuth } = require('../middleware/auth');

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