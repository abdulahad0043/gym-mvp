const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  checkedInAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast per-member lookups
attendanceSchema.index({ member: 1, checkedInAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
