const express = require('express');
const router  = express.Router();
const Plan    = require('../models/Plan');
const Member  = require('../models/Member');
const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/assign-plan', async (req, res, next) => {
  try {
    const { memberId, diet_plan, workout_plan, note } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (diet_plan    !== undefined) member.diet_plan    = diet_plan;
    if (workout_plan !== undefined) member.workout_plan = workout_plan;
    await member.save();
    const planLog = await Plan.create({ member: memberId, diet_plan, workout_plan, note });
    res.json({ success: true, data: { member, planLog } });
  } catch (err) { next(err); }
});

router.get('/:memberId', async (req, res, next) => {
  try {
    const history = await Plan.find({ member: req.params.memberId }).sort({ assignedAt: -1 });
    res.json({ success: true, count: history.length, data: history });
  } catch (err) { next(err); }
});

module.exports = router;
