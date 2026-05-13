const Ticket = require('../models/Ticket');

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
const CRITICAL_PRIORITY = 1;
const SYSTEM_ESCALATION_NOTE = 'Automatically escalated to Critical due to 3 days without resolution.';

async function escalateStagnantTickets() {
  const threeDaysAgo = new Date(Date.now() - THREE_DAYS_IN_MS);

  const result = await Ticket.updateMany(
    {
      status: { $ne: 'resolved' },
      priority: { $ne: CRITICAL_PRIORITY },
      createdAt: { $lt: threeDaysAgo }
    },
    {
      $set: {
        priority: CRITICAL_PRIORITY,
        updatedAt: new Date()
      },
      $push: {
        internalNotes: {
          content: SYSTEM_ESCALATION_NOTE,
          createdAt: new Date()
        }
      }
    }
  );

  const escalatedCount = result.modifiedCount || 0;
  console.log(`Escalated ${escalatedCount} tickets to Critical due to 3-day inactivity`);

  return escalatedCount;
}

module.exports = {
  escalateStagnantTickets
};
