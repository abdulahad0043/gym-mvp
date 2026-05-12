const express    = require('express');
const router     = express.Router();
const Member     = require('../models/Member');
const Attendance = require('../models/Attendance');
const Fee        = require('../models/Fee');
const { protectMember } = require('../middleware/memberAuth');
const { sendWhatsApp, checkinMsg } = require('../utils/sms');

// ── Member self check-in ─────────────────────────────────────
router.post('/checkin', protectMember, async (req, res, next) => {
  try {
    const member = req.member;
    if (member.status === 'suspended')
      return res.status(403).json({ success: false, message: 'Your membership is suspended. Please contact the gym.' });

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const already = await Attendance.findOne({ member: member._id, checkedInAt: { $gte: startOfDay } });
    if (already) return res.status(409).json({ success: false, message: 'You have already checked in today!' });

    await Attendance.create({ member: member._id });

    const warning = member.status === 'overdue' ? 'Your membership is overdue. Please renew soon.' : null;

    // Send WhatsApp confirmation
    try { await sendWhatsApp(member.phone, checkinMsg(member.fullName, member.memberId)); } catch(e) {}

    res.status(201).json({ success: true, message: 'Checked in successfully!', ...(warning && { warning }) });
  } catch (err) { next(err); }
});

// ── Member profile ───────────────────────────────────────────
router.get('/profile', protectMember, async (req, res, next) => {
  try {
    const member = await Member.findById(req.member._id).select('-password');
    // Last 10 check-ins
    const attendance = await Attendance.find({ member: member._id }).sort({ checkedInAt: -1 }).limit(10);
    // Unpaid fees
    const fees = await Fee.find({ member: member._id, paid: false }).sort({ dueDate: 1 });
    res.json({ success: true, data: { member, attendance, fees } });
  } catch (err) { next(err); }
});

module.exports = router;
