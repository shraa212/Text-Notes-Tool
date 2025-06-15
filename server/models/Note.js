const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, trim: true, default: "" },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    color: { type: String, default: '#fff8dc' },
    font: { type: String, default: 'sans-serif' },
    pinned: { type: Boolean, default: false },
    labels: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every(label => typeof label === 'string'),
        message: 'All labels must be strings'
      }
    },
    deleted: { type: Boolean, default: false }  // ✅ Soft delete flag
  },
  {
    timestamps: true
  }
);

noteSchema.index({ pinned: -1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
