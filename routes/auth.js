const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

module.exports = router;
