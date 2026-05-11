const mongoose = require('mongoose');
const feeSchema = new mongoose.Schema({
  member:    { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount:    { type: Number, required: true },
  currency:  { type: String, default: 'PKR' },
  paid:      { type: Boolean, default: false },
  paidAt:    { type: Date },
  dueDate:   { type: Date, required: true },
  note:      { type: String, default: '' },
  smsSentAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('Fee', feeSchema);
