const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * POST /api/auth/login
 * For an MVP we keep a single admin credential in .env.
 * Swap this for a proper Admin model when you scale up.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
