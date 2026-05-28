const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

// Add mistake
router.post('/add', authMiddleware, (req, res) => {
  const { question_id } = req.body;
  try {
    db.run('INSERT OR IGNORE INTO mistakes (user_id, question_id) VALUES (?, ?)', [req.user.id, question_id]);
    res.json({ message: 'Ошибка добавлена' });
  } catch (e) {
    res.json({ message: 'Уже есть' });
  }
});

// Get my mistake question IDs
router.get('/my', authMiddleware, (req, res) => {
  const mistakes = db.all('SELECT question_id FROM mistakes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(mistakes.map(m => m.question_id));
});

// Get my mistake questions with full data
router.get('/questions', authMiddleware, (req, res) => {
  const questions = db.all(
    'SELECT q.* FROM questions q INNER JOIN mistakes m ON q.id = m.question_id WHERE m.user_id = ? ORDER BY m.created_at DESC',
    [req.user.id]
  );
  res.json(questions);
});

// Remove specific mistake
router.delete('/remove/:questionId', authMiddleware, (req, res) => {
  db.run('DELETE FROM mistakes WHERE user_id = ? AND question_id = ?', [req.user.id, req.params.questionId]);
  res.json({ message: 'Удалено' });
});

// Clear all mistakes
router.delete('/clear', authMiddleware, (req, res) => {
  db.run('DELETE FROM mistakes WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'Все ошибки очищены' });
});

module.exports = router;
