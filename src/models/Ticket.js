// src/models/Ticket.js - CORRECT VERSION
const mongoose = require('mongoose');

const generateTicketNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TKT-${timestamp}-${random}`;
};

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    default: generateTicketNumber
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['IT', 'enrolment', 'academic', 'accommodation/finance'],
    required: true
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  priority: {
    type: Number,
    enum: [1, 2, 3],
    default: 3
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'archived'],
    default: 'open'
  },
  assignedToStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  internalNotes: [
    {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  studentNotes: [
    {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      isResolvingComment: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ticketSchema.pre('save', async function() {
  try {
    const priorityMap = {
      'IT_high': 1,
      'enrolment_high': 1,
      'academic_high': 1,
      'accommodation/finance_high': 1,
      'IT_medium': 2,
      'enrolment_medium': 2,
      'academic_medium': 2,
      'accommodation/finance_medium': 2,
      'IT_low': 3,
      'enrolment_low': 3,
      'academic_low': 3,
      'accommodation/finance_low': 3
    };

    const key = `${this.category}_${this.urgencyLevel}`;
    this.priority = priorityMap[key] || 3;
    this.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
