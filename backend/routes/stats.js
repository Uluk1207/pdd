const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { adminMiddleware } = require('../middleware/auth');

// Public stats
router.get('/public', (req, res) => {
  const users = db.get('SELECT COUNT(*) as count FROM users', []);
  const tests = db.get('SELECT COUNT(*) as count FROM tests', []);
  const questions = db.get('SELECT COUNT(*) as count FROM questions', []);
  const results = db.get('SELECT COUNT(*) as count FROM results', []);
  res.json({ users: users.count, tests: tests.count, questions: questions.count, results: results.count });
});

// Rating
router.get('/rating', (req, res) => {
  const rating = db.all(`
    SELECT u.id, u.name, u.login,
      COUNT(r.id) as tests_count,
      ROUND(AVG(r.score), 1) as avg_score,
      MAX(r.score) as best_score
    FROM users u
    LEFT JOIN results r ON u.id = r.user_id
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY avg_score DESC, best_score DESC
    LIMIT 50
  `, []);
  res.json(rating);
});

// Admin stats
router.get('/admin', adminMiddleware, (req, res) => {
  const users = db.get('SELECT COUNT(*) as count FROM users', []);
  const tests = db.get('SELECT COUNT(*) as count FROM tests', []);
  const questions = db.get('SELECT COUNT(*) as count FROM questions', []);
  const results = db.get('SELECT COUNT(*) as count FROM results', []);
  const recent = db.all('SELECT r.*, u.name, u.login FROM results r JOIN users u ON r.user_id = u.id ORDER BY r.date DESC LIMIT 10', []);
  res.json({ users: users.count, tests: tests.count, questions: questions.count, results: results.count, recent });
});

module.exports = router;
