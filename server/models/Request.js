const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a request title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a request description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    priority: {
      type: String,
      required: [true, 'Please select priority level'],
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Approved',
        'Rejected',
        'Needs Clarification',
        'Closed',
        'Reopened',
      ],
      default: 'Submitted',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', requestSchema);
