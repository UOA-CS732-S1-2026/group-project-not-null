const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/user');

const CATEGORY_LABELS = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance'
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved'
};

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

function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical';
  if (priority === 2) return 'High';
  if (priority === 3) return 'Low';
  return 'Medium';
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

async function requireStaff(req, res) {
  const user = await User.findById(req.user.userId);

  if (!user || user.role !== 'staff') {
    res.status(403).json({ error: 'Only staff can access this resource' });
    return null;
  }

  return user;
}

router.get('/tickets', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const {
      status,
      priority,
      category,
      assignedTo,
      search,
      searchQuery,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
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

router.get('/tickets/urgent', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const agingThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tickets = await Ticket.find({
      status: { $ne: 'resolved' },
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

router.get('/dashboard/summary', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

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
      Ticket.countDocuments({ status: 'resolved', resolvedAt: { $gte: today } }),
      Ticket.countDocuments({ priority: { $in: [1, 2] }, status: { $ne: 'resolved' } }),
      Ticket.countDocuments({ assignedToStaffId: req.user.userId, status: { $ne: 'resolved' } }),
      Ticket.find({ status: 'resolved', resolvedAt: { $ne: null } }).select('createdAt resolvedAt')
    ]);

    const averageMs = resolvedTickets.length
      ? resolvedTickets.reduce((sum, ticket) => (
          sum + (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime())
        ), 0) / resolvedTickets.length
      : null;

    res.status(200).json({
      summary: {
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

router.get('/dashboard/analytics', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const [byCategory, byStatus] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: '$category', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
      Ticket.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }, { $sort: { value: -1 } }])
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

router.get('/activity', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

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

router.get('/notifications', verifyAuth, async (req, res) => {
  try {
    const user = await requireStaff(req, res);
    if (!user) return;

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
