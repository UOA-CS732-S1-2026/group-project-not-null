const Ticket = require('../models/Ticket');

async function getTicketsAssignedToStaff(staffUserId) {
  const tickets = await Ticket.find({ assignedToStaffId: staffUserId })
    .populate('studentId', 'email firstName lastName department')
    .populate('assignedToStaffId', 'email firstName lastName department')
    .sort({ priority: 1, updatedAt: -1 });

  const unresolvedTickets = tickets.filter((ticket) => ticket.status !== 'resolved');

  const summary = {
    assignedToMe: unresolvedTickets.length,
    inProgress: unresolvedTickets.filter((ticket) => ticket.status === 'in_progress').length,
    highPriority: unresolvedTickets.filter((ticket) => [1, 2].includes(ticket.priority)).length
  };

  return { tickets, summary };
}

module.exports = {
  getTicketsAssignedToStaff
};
