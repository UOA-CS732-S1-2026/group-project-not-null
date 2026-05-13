const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/user');
const { getPriorityLabel } = require('../services/priorityUtils');
const { getTicketsAssignedToStaff } = require('../services/staffTicketService');
const { serializeTicketWithAttachment } = require('../services/ticketAttachmentService');

const CATEGORY_LABELS = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance'
};

const DEPT_TO_CATEGORY = {
  'IT': 'IT',
  'Enrolment': 'enrolment',
  'Academic': 'academic',
  'Accommodation & Finance': 'accommodation/finance',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived'
};

const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'archived'];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTimeAgo(date) {
  if (!date) return 'Unknown';

  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getPersonName(user, fallback = 'Unassigned') {
  if (!user) return fallback;
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback;
}

function formatAverageResponseTime(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return 'N/A';
  }

  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))}m`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}

function requireActiveStaff(req, res, next) {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Only staff can access this resource' });
  }
  // null = pre-existing staff without staffStatus (treat as active)
  if (req.user.staffStatus === 'pending' || req.user.staffStatus === 'inactive') {
    return res.status(403).json({ error: 'Active staff account required' });
  }
  next();
}

async function requireStaff(req, res) {
  if (req.user.role !== 'staff') {
    res.status(403).json({ error: 'Only staff can access this resource' });
    return null;
  }

  const user = await User.findById(req.user.userId)
    .select('email firstName lastName department role staffStatus isActive');

  if (!user || !user.isActive) {
    res.status(403).json({ error: 'Active staff account required' });
    return null;
  }

  if (user.staffStatus === 'pending' || user.staffStatus === 'inactive') {
    res.status(403).json({ error: 'Active staff account required' });
    return null;
  }

  return user;
}

async function findAssignableStaff(staffId) {
  if (!staffId) return null;
  return User.findOne({ _id: staffId, role: 'staff', isActive: true })
    .select('email firstName lastName department');
}

function requireStaffOrAdmin(req, res, next) {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff access required' });
  }

  next();
}

router.get('/tickets', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      search,
      searchQuery,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    // Always exclude archived tickets; allow further filtering by a specific status
    filter.status = { $ne: 'archived' };
    if (status && status !== 'archived') filter.status = status;

    // Restrict to department unless viewing tickets assigned to this staff member
    if (assignedTo !== 'me') {
      const staffUser = await User.findById(req.user.userId).select('department');
      const deptCategory = DEPT_TO_CATEGORY[staffUser?.department];
      if (deptCategory) filter.category = deptCategory;
    }
    if (priority === 'high') {
      filter.priority = { $in: [1, 2] };
    } else if (priority) {
      filter.priority = Number(priority);
    }
    if (assignedTo === 'me') filter.assignedToStaffId = req.user.userId;
    if (assignedTo && assignedTo !== 'me' && assignedTo !== 'all') {
      filter.assignedToStaffId = assignedTo;
    }

    const normalizedSearch = search || searchQuery;
    if (normalizedSearch) {
      filter.$or = [
        { title: { $regex: normalizedSearch, $options: 'i' } },
        { description: { $regex: normalizedSearch, $options: 'i' } },
        { ticketNumber: { $regex: normalizedSearch, $options: 'i' } }
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName')
        .sort({ priority: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Ticket.countDocuments(filter)
    ]);

    res.status(200).json({
      message: 'All tickets retrieved',
      tickets,
      total,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/tickets/urgent', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const agingThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const staffUser = await User.findById(req.user.userId).select('department');
    const deptCategory = DEPT_TO_CATEGORY[staffUser?.department];
    const deptFilter = deptCategory ? { category: deptCategory } : {};

    const tickets = await Ticket.find({
      ...deptFilter,
      status: { $nin: ['resolved', 'archived'] },
      $or: [
        { priority: 1 },
        { urgencyLevel: 'high' },
        { updatedAt: { $lte: agingThreshold } }
      ]
    })
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName')
      .sort({ priority: 1, updatedAt: 1 })
      .limit(8);

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Get urgent tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const staffUsers = await User.find({ role: 'staff', isActive: true })
      .select('email firstName lastName department')
      .sort({ firstName: 1, lastName: 1, email: 1 });
    res.status(200).json({ users: staffUsers });
  } catch (error) {
    console.error('Get staff users error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-tickets', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const { tickets, summary } = await getTicketsAssignedToStaff(req.user.userId);

    res.status(200).json({
      message: 'Assigned tickets retrieved',
      tickets,
      summary
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch assigned tickets' });
  }
});

router.get('/tickets/:id', verifyAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName department')
      .populate('internalNotes.staffId', 'email firstName lastName department')
      .populate('studentNotes.staffId', 'email firstName lastName department');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({ ticket: serializeTicketWithAttachment(ticket) });
  } catch (error) {
    console.error('Get staff ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/summary', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const today = startOfToday();

    const [
      openTickets,
      inProgressTickets,
      resolvedToday,
      highPriorityTickets,
      assignedToMe,
      resolvedTickets
    ] = await Promise.all([
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({
        status: 'resolved',
        resolvedAt: { $gte: today },
        assignedToStaffId: req.user.userId
      }),
      Ticket.countDocuments({
        priority: { $in: [1, 2] },
        status: { $ne: 'resolved' },
        assignedToStaffId: req.user.userId
      }),
      Ticket.countDocuments({ assignedToStaffId: req.user.userId, status: { $ne: 'resolved' } }),
      Ticket.find({
        status: 'resolved',
        resolvedAt: { $ne: null },
        assignedToStaffId: req.user.userId
      }).select('createdAt resolvedAt')
    ]);

    const averageMs = resolvedTickets.length
      ? resolvedTickets.reduce((sum, ticket) => (
          sum + (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime())
        ), 0) / resolvedTickets.length
      : null;

    res.status(200).json({
      summary: {
        openTickets,
        openTickets,
        inProgressTickets,
        resolvedToday,
        highPriorityTickets,
        assignedToMe,
        averageResponseTime: formatAverageResponseTime(
          averageMs === null ? null : averageMs / (1000 * 60 * 60)
        )
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/analytics', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const matchAssigned = { $match: { assignedToStaffId: req.user.userId } };

    const [byCategory, byStatus] = await Promise.all([
      Ticket.aggregate([
        matchAssigned,
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $sort: { value: -1 } }
      ]),
      Ticket.aggregate([
        matchAssigned,
        { $group: { _id: '$status', value: { $sum: 1 } } },
        { $sort: { value: -1 } }
      ])
    ]);

    res.status(200).json({
      ticketsByCategory: byCategory.map((item) => ({
        name: CATEGORY_LABELS[item._id] || item._id,
        value: item.value
      })),
      ticketsByStatus: byStatus.map((item) => ({
        name: STATUS_LABELS[item._id] || item._id,
        value: item.value
      }))
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/activity', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(8);

    const activity = tickets.map((ticket) => {
      const studentName = getPersonName(ticket.studentId, 'a student');

      if (ticket.status === 'resolved') {
        return {
          id: `${ticket._id}-resolved`,
          type: 'resolved',
          text: `Resolved ${ticket.ticketNumber || 'ticket'} for ${studentName}`,
          timestamp: ticket.resolvedAt || ticket.updatedAt
        };
      }

      if (ticket.assignedToStaffId) {
        return {
          id: `${ticket._id}-assigned`,
          type: 'assigned',
          text: `Assigned ${ticket.ticketNumber || 'ticket'} to ${getPersonName(ticket.assignedToStaffId)}`,
          timestamp: ticket.updatedAt
        };
      }

      return {
        id: `${ticket._id}-submitted`,
        type: 'submitted',
        text: `New ${CATEGORY_LABELS[ticket.category] || ticket.category} ticket submitted by ${studentName}`,
        timestamp: ticket.createdAt
      };
    });

    res.status(200).json({ activity });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      status: { $ne: 'resolved' },
      $or: [{ priority: 1 }, { urgencyLevel: 'high' }]
    })
      .sort({ updatedAt: -1 })
      .limit(6);

    const notifications = tickets.map((ticket) => ({
      id: `${ticket._id}-notification`,
      title: ticket.title,
      message: `${getPriorityLabel(ticket.priority)} priority ticket needs attention`,
      timestamp: ticket.updatedAt,
      read: false
    }));

    res.status(200).json({
      notifications,
      unreadCount: notifications.length
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/tickets/:id', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const { status, assignedToStaffId } = req.body;
    const hasStatusUpdate = status !== undefined;
    const hasAssignmentUpdate = assignedToStaffId !== undefined;

    if (!hasStatusUpdate && !hasAssignmentUpdate) {
      return res.status(400).json({ error: 'Provide a status or assignment update' });
    }

    if (hasStatusUpdate && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (hasStatusUpdate && status === 'resolved') {
      const existingTicket = await Ticket.findById(req.params.id).select('studentNotes');

      if (!existingTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const hasResolvingComment = existingTicket.studentNotes?.some((note) => (
        note.isResolvingComment
      ));

      if (!hasResolvingComment) {
        return res.status(400).json({
          error: 'Add a student note marked as the resolving comment before resolving this ticket.'
        });
      }
    }

    const updateData = {};

    if (hasStatusUpdate) {
      updateData.status = status;
      updateData.resolvedAt = status === 'resolved' ? new Date() : null;
    }

    if (hasAssignmentUpdate) {
      if (assignedToStaffId === null || assignedToStaffId === '') {
        updateData.assignedToStaffId = null;
      } else {
        const normalizedStaffId = assignedToStaffId === 'me'
          ? req.user.userId
          : assignedToStaffId;

        const assignableStaff = await findAssignableStaff(normalizedStaffId);

        if (!assignableStaff) {
          return res.status(400).json({ error: 'Assigned staff member not found' });
        }

        updateData.assignedToStaffId = assignableStaff._id;
      }
    }

    updateData.updatedAt = new Date();

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName department')
      .populate('internalNotes.staffId', 'email firstName lastName department')
      .populate('studentNotes.staffId', 'email firstName lastName department');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket: serializeTicketWithAttachment(ticket)
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/tickets/:id/notes', verifyAuth, requireActiveStaff, async (req, res) => {
  try {
    const content = req.body.content?.trim();
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
      .populate('assignedToStaffId', 'email firstName lastName department')
      .populate('internalNotes.staffId', 'email firstName lastName department')
      .populate('studentNotes.staffId', 'email firstName lastName department');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Note added successfully',
      ticket: serializeTicketWithAttachment(ticket)
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/tickets/:id/student-notes', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const content = req.body.content?.trim();
    const isResolvingComment = Boolean(req.body.isResolvingComment);

    if (!content) {
      return res.status(400).json({ error: 'Student note content required' });
    }

    const updateData = {
      $push: {
        studentNotes: {
          staffId: req.user.userId,
          content,
          isResolvingComment,
          createdAt: new Date()
        }
      },
      updatedAt: new Date()
    };

    if (isResolvingComment) {
      updateData.status = 'resolved';
      updateData.resolvedAt = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    )
      .populate('studentId', 'email firstName lastName')
      .populate('assignedToStaffId', 'email firstName lastName department')
      .populate('internalNotes.staffId', 'email firstName lastName department')
      .populate('studentNotes.staffId', 'email firstName lastName department');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Student note added successfully',
      ticket: serializeTicketWithAttachment(ticket)
    });
  } catch (error) {
    console.error('Add student note error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/summary', verifyAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
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
