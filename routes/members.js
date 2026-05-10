const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

// All member routes require a valid JWT
router.use(protect);

/**
 * POST /api/members/register
 * Body: { name, phone, membership_start?, membership_expiry }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, membership_start, membership_expiry } = req.body;

    const member = await Member.create({ name, phone, membership_start, membership_expiry });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/members
 * Returns all members with daysRemaining virtual.
 * Query: ?status=overdue|active|suspended
 */
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    // Refresh overdue status in bulk before returning
    await Member.updateMany(
      { membership_expiry: { $lt: new Date() }, status: { $ne: 'overdue' } },
      { $set: { status: 'overdue' } }
    );

    const members = await Member.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/members/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/members/:id
 * Update name, phone, dates, or status.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/members/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
