const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.model('Counter', counterSchema);

const memberSchema = new mongoose.Schema({
  memberId:         { type: String, unique: true },
  name:             { type: String, required: [true, 'Name is required'], trim: true },
  phone:            { type: String, required: [true, 'Phone is required'], unique: true, trim: true },
  membership_start: { type: Date, default: Date.now },
  membership_expiry:{ type: Date, required: [true, 'Expiry date is required'] },
  status:           { type: String, enum: ['active','overdue','suspended'], default: 'active' },
  diet_plan:        { type: String, default: '' },
  workout_plan:     { type: String, default: '' },
}, { timestamps: true });

memberSchema.virtual('daysRemaining').get(function () {
  return Math.ceil((new Date(this.membership_expiry) - new Date()) / (1000*60*60*24));
});

memberSchema.pre('save', async function (next) {
  if (!this.memberId) {
    const counter = await Counter.findByIdAndUpdate('memberId', { $inc: { seq: 1 } }, { new: true, upsert: true });
    this.memberId = 'GYM-' + String(counter.seq).padStart(4, '0');
  }
  if (new Date(this.membership_expiry) < new Date()) this.status = 'overdue';
  next();
});

memberSchema.set('toJSON',   { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
