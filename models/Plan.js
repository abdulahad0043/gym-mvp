const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
  member:       { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  diet_plan:    { type: String, default: '' },
  workout_plan: { type: String, default: '' },
  assignedAt:   { type: Date, default: Date.now },
  note:         { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Plan', planSchema);
