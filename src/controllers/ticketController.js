const { sendEmail } = require('../utils/sendEmail');
// src/controllers/ticketController.js
const Ticket = require('../models/Ticket');
const User = require('../models/user');
const {
  getFallbackPriorityTier,
  getPriorityValue,
  normalizePriorityTier
} = require('../services/priorityUtils');
 
/**
 * Create a new ticket (Student)
 * POST /api/tickets
 */
const createTicket = async (req, res) => {
  try {
    const { title, description, category, urgencyLevel, priority } = req.body;
 
    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        error: 'Please provide title, description, and category'
      });
    }
 
    const validCategories = ['IT', 'enrolment', 'academic', 'accommodation/finance'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }
 
    const validUrgencies = ['low', 'medium', 'high'];
    const urgency = urgencyLevel || 'medium';
    if (!validUrgencies.includes(urgency)) {
      return res.status(400).json({
        error: `Invalid urgency level. Must be one of: ${validUrgencies.join(', ')}`
      });
    }

    const priorityTier = normalizePriorityTier(priority) || getFallbackPriorityTier(urgency);
 
    // Create ticket
    const ticket = new Ticket({
      studentId: req.user.userId,
      title,
      description,
      category,
      urgencyLevel: urgency,
      priority: getPriorityValue(priorityTier)
    });
 
    await ticket.save();
 
    // Populate student info before returning
    await ticket.populate('studentId', 'firstName lastName email');

    //Email sending
    await sendEmail({
      to: ticket.studentId.email,
      subject: 'UniDesk Ticket Created',
      text: `Hello ${ticket.studentId.firstName},

    Your support ticket has been created successfully.

    Title: ${ticket.title}
    Category: ${ticket.category}
    Urgency: ${ticket.urgencyLevel}

    We will update you once the ticket status changes.

    - UniDesk Support Team`,
    });
 
    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
 
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create ticket'
    });
  }
};
 
/**
 * Get all tickets for current student
 * GET /api/tickets
 * Query params: ?status=open&limit=10&page=1
 */
const getStudentTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
 
    // Build filter
    const filter = { studentId: req.user.userId };
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      filter.status = status;
    }
 
    // Get total count
    const total = await Ticket.countDocuments(filter);
 
    // Get tickets with pagination
    const tickets = await Ticket.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('assignedToStaffId', 'firstName lastName email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
 
    res.status(200).json({
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
 
  } catch (error) {
    console.error('Get student tickets error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch tickets'
    });
  }
};
 
/**
 * Get single ticket details (Student)
 * GET /api/tickets/:id
 */
const getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('studentId', 'firstName lastName email')
      .populate('assignedToStaffId', 'firstName lastName email department')
      .populate('studentNotes.staffId', 'firstName lastName email');
 
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
 
    const isOwner = ticket.studentId._id.toString() === req.user.userId;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';
    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        error: 'You do not have permission to view this ticket'
      });
    }
 
    res.status(200).json({ ticket });
 
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch ticket'
    });
  }
};
 
/**
 * Get all tickets for staff
 * GET /api/staff/tickets
 * Query params: ?status=open&category=IT&assignedTo=userId&limit=10&page=1
 */
const getStaffTickets = async (req, res) => {
  try {
    const { status, category, assignedTo, searchQuery, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
 
    // Build filter
    const filter = {};
 
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      filter.status = status;
    }
 
    if (category) {
      const validCategories = ['IT', 'enrolment', 'academic', 'accommodation/finance'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
      filter.category = category;
    }
 
    if (assignedTo) {
      filter.assignedToStaffId = assignedTo;
    }
 
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { ticketNumber: { $regex: searchQuery, $options: 'i' } }
      ];
    }
 
    // Get total count
    const total = await Ticket.countDocuments(filter);
 
    // Get tickets with sorting by priority (1 = highest) and creation date
    const tickets = await Ticket.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('assignedToStaffId', 'firstName lastName email department')
      .populate('internalNotes.staffId', 'firstName lastName')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
 
    res.status(200).json({
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
 
  } catch (error) {
    console.error('Get staff tickets error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch tickets'
    });
  }
};
 
/**
 * Update ticket status (Staff)
 * PATCH /api/staff/tickets/:id
 * Body: { status: 'open' | 'in_progress' | 'resolved', assignedToStaffId?: string }
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedToStaffId } = req.body;
 
    if (!status) {
      return res.status(400).json({
        error: 'Please provide a status'
      });
    }
 
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
 
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(assignedToStaffId && { assignedToStaffId }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'firstName lastName email')
     .populate('assignedToStaffId', 'firstName lastName email');
 
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
 
    // If resolved, set resolvedAt
    if (status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
      await ticket.save();
    }
 
    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket
    });
 
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update ticket'
    });
  }
};
 
/**
 * Add internal note to ticket (Staff)
 * POST /api/staff/tickets/:id/notes
 * Body: { content: 'staff note text' }
 */
const addInternalNote = async (req, res) => {
  try {
    const { content } = req.body;
 
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Note content is required'
      });
    }
 
    const ticket = await Ticket.findById(req.params.id);
 
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
 
    // Add note
    ticket.internalNotes.push({
      staffId: req.user.userId,
      content: content.trim()
    });
 
    await ticket.save();
 
    // Populate for response
    await ticket.populate('internalNotes.staffId', 'firstName lastName email');
 
    res.status(201).json({
      message: 'Note added successfully',
      ticket
    });
 
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      error: error.message || 'Failed to add note'
    });
  }
};
 
module.exports = {
  createTicket,
  getStudentTickets,
  getTicketDetails,
  getStaffTickets,
  updateTicketStatus,
  addInternalNote
};
