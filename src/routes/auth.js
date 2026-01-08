const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}, received password/OTP: ${password}`);
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log(`User not found for email: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  console.log(`User found: ${user.email}, hashed password in DB: ${user.password}`);
  const isValid = await bcrypt.compare(password, user.password);
  console.log(`Password comparison result: ${isValid}`);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  res.json({ token, refreshToken, user: { id: user.id, email: user.email } });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;