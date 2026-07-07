const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { jwtSecret, managerSecret } = require('../config');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'employee', managerCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!['employee', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (role === 'manager' && managerCode !== managerSecret) {
    return res.status(403).json({ message: 'Manager code is required to register a manager account' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to validate email' });
    }
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [name, email, hashed, role],
      function (insertErr) {
        if (insertErr) {
          return res.status(500).json({ message: 'Unable to create user' });
        }
        const user = { id: this.lastID, name, email, role };
        const token = jwt.sign(user, jwtSecret, { expiresIn: '7d' });
        res.status(201).json({ user, token });
      }
    );
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get('SELECT id, name, email, password, role FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Login failed' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
    res.json({ user: tokenPayload, token });
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
