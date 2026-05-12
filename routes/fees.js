const express  = require('express');
const router   = express.Router();
const Fee      = require('../models/Fee');
const Member   = require('../models/Member');
const { protect } = require('../middleware/auth');
const { sendWhatsApp, overdueMsg, reminderMsg } = require('../utils/sms');

// Saare routes ko protect karne ke liye authentication middleware
router.use(protect);

// 1. Naya Fee record create karna
router.post('/', async (req, res, next) => {
  try {
    const { memberId, amount, dueDate, note } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    
    const fee = await Fee.create({ member: memberId, amount, dueDate, note });
    res.status(201).json({ success: true, data: fee });
  } catch (err) { next(err); }
});

// 2. Dashboard summary (Total, Overdue, aur Collection)
router.get('/summary', async (req, res, next) => {
  try {
    const now = new Date();
    const [totalUnpaid, overdue, collected] = await Promise.all([
      Fee.countDocuments({ paid: false }),
      Fee.countDocuments({ paid: false, dueDate: { $lt: now } }),
      Fee.aggregate([{ $match: { paid: true } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    res.json({ success: true, data: { totalUnpaid, overdue, totalCollected: collected[0]?.total || 0 } });
  } catch (err) { next(err); }
});

// 3. Fees ki list (Filters ke saath)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.memberId) filter.member = req.query.memberId;
    if (req.query.paid !== undefined) filter.paid = req.query.paid === 'true';
    
    const fees = await Fee.find(filter).populate('member', 'name fullName memberId phone').sort({ dueDate: 1 });
    res.json({ success: true, count: fees.length, data: fees });
  } catch (err) { next(err); }
});

// 4. Fee payment confirm karna
router.put('/:id/pay', async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, { paid: true, paidAt: new Date() }, { new: true })
      .populate('member', 'name fullName memberId phone');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    res.json({ success: true, data: fee });
  } catch (err) { next(err); }
});

// 5. CRITICAL: Saare overdue members ko WhatsApp bhejna (With Delay)
router.post('/sms-all-overdue', async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Fee.find({ paid: false, dueDate: { $lt: now } }).populate('member');
    const results = [];

    for (const fee of overdue) {
      try {
        // Anti-spam delay: Har message ke darmiyan 3 seconds ka waqfa
        await new Promise(resolve => setTimeout(resolve, 3000));

        const days = Math.ceil((now - new Date(fee.dueDate)) / 86400000);
        const name = fee.member.fullName || fee.member.name;
        
        await sendWhatsApp(fee.member.phone, overdueMsg(name, fee.member.memberId, fee.amount, days));
        
        await Fee.findByIdAndUpdate(fee._id, { smsSentAt: now });
        results.push({ member: name, status: 'sent' });
      } catch (e) { 
        results.push({ member: fee.member.fullName, status: 'failed', error: e.message }); 
      }
    }
    res.json({ success: true, results });
  } catch (err) { next(err); }
});

// 6. Kisi ek specific fee ka reminder bhejna
router.post('/:id/sms', async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('member');
    if (!fee)    return res.status(404).json({ success: false, message: 'Fee not found' });
    if (fee.paid) return res.status(400).json({ success: false, message: 'Fee already paid' });

    const now      = new Date();
    const name     = fee.member.fullName || fee.member.name;
    const daysLate = Math.ceil((now - new Date(fee.dueDate)) / 86400000);
    const daysLeft = Math.ceil((new Date(fee.dueDate) - now) / 86400000);

    // Agar due date guzar chuki hai to overdueMsg, warna reminderMsg
    const msg = daysLate > 0
      ? overdueMsg(name, fee.member.memberId, fee.amount, daysLate)
      : reminderMsg(name, fee.member.memberId, fee.amount, daysLeft);

    await sendWhatsApp(fee.member.phone, msg);
    await Fee.findByIdAndUpdate(req.params.id, { smsSentAt: now });
    
    res.json({ success: true, message: 'WhatsApp message sent', to: fee.member.phone });
  } catch (err) { next(err); }
});

module.exports = router;