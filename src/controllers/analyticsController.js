// src/controllers/analyticsController.js
const Ticket = require('../models/Ticket');
 
/**
 * Get analytics data for staff dashboard
 * GET /api/staff/analytics
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    // Ticket counts by status
    const byStatus = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
 
    // Ticket counts by category
    const byCategory = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
 
    // Ticket counts by priority
    const byPriority = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
 
    // Cross-tabulation: status by category
    const statusByCategory = await Ticket.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.status': 1, '_id.category': 1 }
      }
    ]);
 
    // Average time to resolve (for resolved tickets)
    const avgResolutionTime = await Ticket.aggregate([
      {
        $match: { status: 'resolved', resolvedAt: { $ne: null } }
      },
      {
        $addFields: {
          resolutionTime: {
            $subtract: ['$resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' },
          minTime: { $min: '$resolutionTime' },
          maxTime: { $max: '$resolutionTime' }
        }
      }
    ]);
 
    // Total ticket count
    const totalTickets = await Ticket.countDocuments();
 
    // Open tickets count
    const openTickets = await Ticket.countDocuments({ status: 'open' });
 
    // In progress tickets count
    const inProgressTickets = await Ticket.countDocuments({ status: 'in_progress' });
 
    // Resolved tickets count
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
 
    // High priority tickets
    const highPriorityTickets = await Ticket.countDocuments({
      priority: 1,
      status: { $ne: 'resolved' }
    });
 
    // Format resolution time from milliseconds to hours
    let avgResolutionHours = null;
    if (avgResolutionTime.length > 0) {
      avgResolutionHours = Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60));
    }
 
    res.status(200).json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        highPriorityTickets,
        avgResolutionHours
      },
      byStatus: formatAggregationResult(byStatus),
      byCategory: formatAggregationResult(byCategory),
      byPriority: formatAggregationResult(byPriority),
      statusByCategory,
      resolutionMetrics: avgResolutionTime.length > 0 ? {
        avgHours: avgResolutionHours,
        minHours: Math.round(avgResolutionTime[0].minTime / (1000 * 60 * 60)),
        maxHours: Math.round(avgResolutionTime[0].maxTime / (1000 * 60 * 60))
      } : null
    });
 
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch analytics'
    });
  }
};
 
/**
 * Get dashboard summary (quick stats)
 * GET /api/staff/analytics/summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      highPriorityTickets
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ priority: 1, status: { $ne: 'resolved' } })
    ]);
 
    res.status(200).json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        highPriorityTickets
      }
    });
 
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch summary'
    });
  }
};
 
/**
 * Get tickets assigned to staff member
 * GET /api/staff/analytics/assigned
 */
const getAssignedTickets = async (req, res) => {
  try {
    const staffId = req.user.userId;
 
    const tickets = await Ticket.find({ assignedToStaffId: staffId })
      .populate('studentId', 'firstName lastName email')
      .sort({ priority: 1, createdAt: -1 });
 
    const count = tickets.length;
    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
 
    res.status(200).json({
      assignedTickets: tickets,
      stats: {
        total: count,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      }
    });
 
  } catch (error) {
    console.error('Get assigned tickets error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch assigned tickets'
    });
  }
};
 
/**
 * Helper function to format aggregation results
 */
function formatAggregationResult(data) {
  return data.map(item => ({
    name: item._id,
    value: item.count
  }));
}
 
module.exports = {
  getDashboardAnalytics,
  getDashboardSummary,
  getAssignedTickets
};