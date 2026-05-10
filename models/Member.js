const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    membership_start: {
      type: Date,
      required: true,
      default: Date.now,
    },
    membership_expiry: {
      type: Date,
      required: [true, 'Membership expiry date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'overdue', 'suspended'],
      default: 'active',
    },
    diet_plan: { type: String, default: '' },
    workout_plan: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Virtual: days remaining (negative = overdue) ────────────
memberSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const expiry = new Date(this.membership_expiry);
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ── Auto-flag overdue before every save ─────────────────────
memberSchema.pre('save', function (next) {
  if (new Date(this.membership_expiry) < new Date()) {
    this.status = 'overdue';
  }
  next();
});

memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
