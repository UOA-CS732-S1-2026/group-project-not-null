const Ticket = require('../models/Ticket');

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

async function archiveResolvedTickets() {
  const cutoff = new Date(Date.now() - ONE_DAY_IN_MS);

  const result = await Ticket.updateMany(
    {
      status: 'resolved',
      $or: [
        { resolvedAt: { $lt: cutoff } },
        { resolvedAt: null, updatedAt: { $lt: cutoff } },
        { resolvedAt: { $exists: false }, updatedAt: { $lt: cutoff } }
      ]
    },
    {
      $set: {
        status: 'archived',
        updatedAt: new Date()
      },
      $push: {
        internalNotes: {
          content: 'Automatically archived 24 hours after resolution.',
          createdAt: new Date()
        }
      }
    }
  );

  const archivedCount = result.modifiedCount || 0;
  console.log(`Archived ${archivedCount} resolved tickets older than 24 hours`);

  return archivedCount;
}

module.exports = {
  archiveResolvedTickets
};
