const express = require('express');
const db = require('../db');
const { authenticate, requireManager, requireEmployee } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireEmployee, (req, res) => {
  const { date, summary, blockers = '', status = 'done' } = req.body;
  if (!date || !summary) {
    return res.status(400).json({ message: 'Date and summary are required' });
  }
  if (!['done', 'in-progress', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.get(
    'SELECT id FROM logs WHERE user_id = ? AND date = ?',
    [req.user.id, date],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ message: 'Unable to verify log entry' });
      }
      if (existing) {
        return res.status(409).json({ message: 'You already submitted a log for this date' });
      }

      db.run(
        'INSERT INTO logs (user_id, date, summary, blockers, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
        [req.user.id, date, summary.trim(), blockers.trim(), status],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({ message: 'Failed to save log entry' });
          }
          return res.status(201).json({ id: this.lastID, user_id: req.user.id, date, summary, blockers, status });
        }
      );
    }
  );
});

router.get('/', authenticate, requireManager, (req, res) => {
  const { date, employee } = req.query;
  const conditions = [];
  const params = [];

  let sql = `
    SELECT logs.id, logs.date, logs.summary, logs.blockers, logs.status, logs.created_at,
      users.id AS user_id, users.name, users.email
    FROM logs
    JOIN users ON users.id = logs.user_id
  `;

  if (date) {
    conditions.push('logs.date = ?');
    params.push(date);
  }
  if (employee) {
    conditions.push('users.email = ?');
    params.push(employee);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY logs.date DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to fetch logs' });
    }
    res.json(rows);
  });
});

router.get('/me', authenticate, (req, res) => {
  db.all(
    'SELECT id, date, summary, blockers, status, created_at FROM logs WHERE user_id = ? ORDER BY date DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Unable to load your logs' });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
