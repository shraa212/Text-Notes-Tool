const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    isDone: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false // ✅ Soft delete flag
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
