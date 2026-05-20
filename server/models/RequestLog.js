const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    old_status: {
      type: String,
      enum: [
        null,
        'Submitted',
        'Approved',
        'Rejected',
        'Needs Clarification',
        'Closed',
        'Reopened',
      ],
      default: null,
    },
    new_status: {
      type: String,
      enum: [
        'Submitted',
        'Approved',
        'Rejected',
        'Needs Clarification',
        'Closed',
        'Reopened',
      ],
      required: true,
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['User', 'Manager', 'Admin'],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Simple schema, timestamp is standard, we use default Date.now
    timestamps: false,
  }
);

module.exports = mongoose.model('RequestLog', requestLogSchema);
