const express  = require('express');
const router   = express.Router();
const Member   = require('../models/Member');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, membership_start, membership_expiry } = req.body;
    const member = await Member.create({ name, phone, membership_start, membership_expiry });
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    await Member.updateMany(
      { membership_expiry: { $lt: new Date() }, status: { $ne: 'overdue' } },
      { $set: { status: 'overdue' } }
    );
    const members = await Member.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
