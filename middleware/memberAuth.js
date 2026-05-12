const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const protectMember = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'member')
      return res.status(403).json({ success: false, message: 'Not a member token' });
    const member = await Member.findById(decoded.memberId);
    if (!member || !member.approved)
      return res.status(401).json({ success: false, message: 'Member not found or not approved' });
    req.member = member;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { protectMember };
