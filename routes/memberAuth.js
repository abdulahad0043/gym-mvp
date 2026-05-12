const express  = require('express');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const Member   = require('../models/Member');
const { sendWhatsApp, welcomeMsg, rejectedMsg } = require('../utils/sms');

// ── Self Registration ────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const {
      fullName, fatherName, phone, password, cnic,
      address, dateOfBirth, gender, email,
      emergencyContact, emergencyContactPhone, membershipType,
    } = req.body;

    const existing = await Member.findOne({ phone });
    if (existing) return res.status(409).json({ success: false, message: 'Phone number already registered' });

    const member = await Member.create({
      fullName, fatherName, phone, password, cnic,
      address, dateOfBirth, gender, email,
      emergencyContact, emergencyContactPhone,
      membershipType: membershipType || 'monthly',
      status: 'pending',
      pendingApproval: true,
      approved: false,
    });

    res.status(201).json({ success: true, message: 'Registration submitted! Please wait for gym owner approval.', data: { fullName: member.fullName, phone: member.phone } });
  } catch (err) { next(err); }
});

// ── Member Login ─────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const member = await Member.findOne({ phone });

    if (!member) return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    if (member.status === 'pending') return res.status(403).json({ success: false, message: 'Your registration is pending approval. Please wait.' });
    if (!member.approved) return res.status(403).json({ success: false, message: 'Account not approved yet.' });

    const valid = await member.comparePassword(password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid phone or password' });

    const token = jwt.sign({ memberId: member._id, role: 'member' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, member: {
      fullName: member.fullName, memberId: member.memberId,
      status: member.status, membership_expiry: member.membership_expiry,
      daysRemaining: member.daysRemaining,
    }});
  } catch (err) { next(err); }
});

// ── Owner: get pending registrations ────────────────────────
router.get('/pending', async (req, res, next) => {
  try {
    const members = await Member.find({ pendingApproval: true, approved: false }).sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) { next(err); }
});

// ── Owner: approve member ────────────────────────────────────
router.put('/approve/:id', async (req, res, next) => {
  try {
    const { membership_start, membership_expiry, membershipType } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    member.approved        = true;
    member.pendingApproval = false;
    member.status          = 'active';
    member.membership_start  = membership_start || new Date();
    member.membership_expiry = membership_expiry;
    if (membershipType) member.membershipType = membershipType;
    await member.save(); // triggers memberId generation

    // Send WhatsApp welcome
    try { await sendWhatsApp(member.phone, welcomeMsg(member.fullName, member.memberId)); } catch(e) { console.log('WhatsApp failed:', e.message); }

    res.json({ success: true, data: member });
  } catch (err) { next(err); }
});

// ── Owner: reject member ─────────────────────────────────────
router.delete('/reject/:id', async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    try { await sendWhatsApp(member.phone, rejectedMsg(member.fullName)); } catch(e) {}
    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Registration rejected and removed' });
  } catch (err) { next(err); }
});

module.exports = router;
