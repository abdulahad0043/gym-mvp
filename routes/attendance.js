const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * POST /api/attendance/checkin
 * Body: { memberId }
 * Prevents double check-in on the same calendar day.
 */
router.post('/checkin', async (req, res, next) => {
  try {
    const { memberId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    // Guard: overdue members can still check in (gym's choice), but warn.
    const warning = member.status === 'overdue' ? 'Membership is overdue' : null;

    // Prevent duplicate check-in on the same day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyCheckedIn = await Attendance.findOne({
      member: memberId,
      checkedInAt: { $gte: startOfDay },
    });

    if (alreadyCheckedIn) {
      return res.status(409).json({ success: false, message: 'Already checked in today' });
    }

    const record = await Attendance.create({ member: memberId });

    res.status(201).json({
      success: true,
      data: record,
      ...(warning && { warning }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/attendance/:memberId
 * Returns last 30 check-ins for a member.
 */
router.get('/:memberId', async (req, res, next) => {
  try {
    const records = await Attendance.find({ member: req.params.memberId })
      .sort({ checkedInAt: -1 })
      .limit(30);

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/attendance
 * Today's check-ins (all members).
 */
router.get('/', async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ checkedInAt: { $gte: startOfDay } })
      .populate('member', 'name phone status')
      .sort({ checkedInAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
