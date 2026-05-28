const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');

// Get all tests
router.get('/', optionalAuth, (req, res) => {
  const { category } = req.query;
  let tests;
  if (category) {
    tests = db.all('SELECT * FROM tests WHERE category = ? ORDER BY id', [category]);
  } else {
    tests = db.all('SELECT * FROM tests ORDER BY id', []);
  }
  res.json(tests);
});

// Get single test
router.get('/:id', (req, res) => {
  const test = db.get('SELECT * FROM tests WHERE id = ?', [req.params.id]);
  if (!test) return res.status(404).json({ message: 'Тест не найден' });
  res.json(test);
});

// Create test (admin)
router.post('/', adminMiddleware, (req, res) => {
  const { title, category, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Название обязательно' });
  const result = db.run('INSERT INTO tests (title, category, description) VALUES (?, ?, ?)',
    [title, category || 'ticket', description || '']);
  const test = db.get('SELECT * FROM tests WHERE id = ?', [result.lastInsertRowid]);
  res.json(test);
});

// Update test (admin)
router.put('/:id', adminMiddleware, (req, res) => {
  const { title, category, description } = req.body;
  db.run('UPDATE tests SET title = ?, category = ?, description = ? WHERE id = ?',
    [title, category, description, req.params.id]);
  const test = db.get('SELECT * FROM tests WHERE id = ?', [req.params.id]);
  res.json(test);
});

// Delete test (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM tests WHERE id = ?', [req.params.id]);
  res.json({ message: 'Тест удалён' });
});

module.exports = router;
