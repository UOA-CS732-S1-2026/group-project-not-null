const Ticket = require('../models/Ticket');

async function getTicketsAssignedToStaff(staffUserId) {
  const tickets = await Ticket.find({ assignedToStaffId: staffUserId })
    .populate('studentId', 'email firstName lastName department')
    .populate('assignedToStaffId', 'email firstName lastName department')
    .sort({ priority: 1, updatedAt: -1 });

  const summary = {
    assignedToMe: tickets.length,
    inProgress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
    highPriority: tickets.filter((ticket) => [1, 2].includes(ticket.priority)).length
  };

  return { tickets, summary };
}

module.exports = {
  getTicketsAssignedToStaff
};
