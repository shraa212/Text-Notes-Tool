const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true // trims spaces before saving
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

// Index for faster lookup
labelSchema.index({ name: 1 });

module.exports = mongoose.model('Label', labelSchema);
