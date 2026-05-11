const express    = require('express');
const router     = express.Router();
const Attendance = require('../models/Attendance');
const Member     = require('../models/Member');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/checkin', async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    const warning = member.status === 'overdue' ? 'Membership is overdue' : null;
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const already = await Attendance.findOne({ member: memberId, checkedInAt: { $gte: startOfDay } });
    if (already) return res.status(409).json({ success: false, message: 'Already checked in today' });
    const record = await Attendance.create({ member: memberId });
    res.status(201).json({ success: true, data: record, ...(warning && { warning }) });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const records = await Attendance.find({ checkedInAt: { $gte: startOfDay } })
      .populate('member', 'name phone status memberId')
      .sort({ checkedInAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
});

router.get('/:memberId', async (req, res, next) => {
  try {
    const records = await Attendance.find({ member: req.params.memberId }).sort({ checkedInAt: -1 }).limit(30);
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
});

module.exports = router;
