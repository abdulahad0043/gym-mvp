const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.model('Counter', counterSchema);

const memberSchema = new mongoose.Schema({
  // Auto ID
  memberId: { type: String, unique: true },

  // Auth
  password: { type: String },
  approved: { type: Boolean, default: false },  // owner must approve
  pendingApproval: { type: Boolean, default: false },

  // Personal Info
  fullName:    { type: String, required: [true, 'Full name is required'], trim: true },
  fatherName:  { type: String, trim: true, default: '' },
  phone:       { type: String, required: [true, 'Phone is required'], unique: true, trim: true },
  cnic:        { type: String, trim: true, default: '' },
  address:     { type: String, trim: true, default: '' },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['male','female','other'], default: 'male' },
  email:       { type: String, trim: true, default: '' },

  // Emergency Contact
  emergencyContact:      { type: String, trim: true, default: '' },
  emergencyContactPhone: { type: String, trim: true, default: '' },

  // Gym Info
  membershipType:   { type: String, enum: ['monthly','quarterly','yearly'], default: 'monthly' },
  membership_start: { type: Date },
  membership_expiry:{ type: Date },
  status:           { type: String, enum: ['active','overdue','suspended','pending'], default: 'pending' },

  // Plans
  diet_plan:    { type: String, default: '' },
  workout_plan: { type: String, default: '' },

  // WhatsApp opt-in
  whatsappOptIn: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: name alias for backward compat
memberSchema.virtual('name').get(function() { return this.fullName; });

memberSchema.virtual('daysRemaining').get(function () {
  if (!this.membership_expiry) return null;
  return Math.ceil((new Date(this.membership_expiry) - new Date()) / (1000*60*60*24));
});

// Auto memberId
memberSchema.pre('save', async function (next) {
  if (!this.memberId && this.approved) {
    const counter = await Counter.findByIdAndUpdate('memberId', { $inc: { seq: 1 } }, { new: true, upsert: true });
    this.memberId = 'GYM-' + String(counter.seq).padStart(4, '0');
  }
  if (this.membership_expiry && new Date(this.membership_expiry) < new Date() && this.status === 'active') {
    this.status = 'overdue';
  }
  // Hash password if modified
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

memberSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

memberSchema.set('toJSON',   { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
