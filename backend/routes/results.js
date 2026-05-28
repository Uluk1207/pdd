const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

// Save result
router.post('/save', authMiddleware, (req, res) => {
  const { test_id, title, score, correct, wrong } = req.body;
  const result = db.run(
    'INSERT INTO results (user_id, test_id, title, score, correct, wrong) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, test_id || null, title || 'Тест', score || 0, correct || 0, wrong || 0]
  );
  res.json({ id: result.lastInsertRowid, message: 'Результат сохранён' });
});

// Get my results
router.get('/my', authMiddleware, (req, res) => {
  const results = db.all('SELECT * FROM results WHERE user_id = ? ORDER BY date DESC LIMIT 50', [req.user.id]);
  res.json(results);
});

// My stats summary
router.get('/my-stats', authMiddleware, (req, res) => {
  const stats = db.get(
    'SELECT COUNT(*) as total, AVG(score) as avg_score, SUM(correct) as total_correct, SUM(wrong) as total_wrong FROM results WHERE user_id = ?',
    [req.user.id]
  );
  res.json(stats);
});

module.exports = router;
