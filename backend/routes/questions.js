const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { adminMiddleware, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Questions for a specific test
router.get('/by-test/:testId', (req, res) => {
  const questions = db.all('SELECT * FROM questions WHERE test_id = ? ORDER BY id', [req.params.testId]);
  res.json(questions);
});

// Random questions (exam/marathon)
router.get('/random', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const questions = db.all('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?', [limit]);
  res.json(questions);
});

// Questions by topic
router.get('/by-topic/:topic', (req, res) => {
  const questions = db.all('SELECT * FROM questions WHERE topic = ? ORDER BY RANDOM() LIMIT 30', [req.params.topic]);
  res.json(questions);
});

// All topics
router.get('/topics', (req, res) => {
  const topics = db.all('SELECT DISTINCT topic FROM questions WHERE topic IS NOT NULL ORDER BY topic', []);
  res.json(topics.map(t => t.topic));
});

// All questions (admin)
router.get('/all', adminMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const total = db.get('SELECT COUNT(*) as cnt FROM questions', []);
  const questions = db.all('SELECT q.*, t.title as test_title FROM questions q LEFT JOIN tests t ON q.test_id = t.id ORDER BY q.id LIMIT ? OFFSET ?', [limit, offset]);
  res.json({ questions, total: total.cnt, page, pages: Math.ceil(total.cnt / limit) });
});

// Single question
router.get('/:id', (req, res) => {
  const q = db.get('SELECT * FROM questions WHERE id = ?', [req.params.id]);
  if (!q) return res.status(404).json({ message: 'Вопрос не найден' });
  res.json(q);
});

// Create question (admin)
router.post('/', adminMiddleware, upload.single('image'), (req, res) => {
  const { test_id, question, answer1, answer2, answer3, answer4, correct_answer, description, topic } = req.body;
  if (!question || !answer1 || !answer2 || !correct_answer)
    return res.status(400).json({ message: 'Заполните обязательные поля' });
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.run(
    'INSERT INTO questions (test_id, question, image, answer1, answer2, answer3, answer4, correct_answer, description, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [test_id || null, question, image, answer1, answer2, answer3 || null, answer4 || null, correct_answer, description || '', topic || 'Общие']
  );
  const q = db.get('SELECT * FROM questions WHERE id = ?', [result.lastInsertRowid]);
  res.json(q);
});

// Update question (admin)
router.put('/:id', adminMiddleware, upload.single('image'), (req, res) => {
  const { test_id, question, answer1, answer2, answer3, answer4, correct_answer, description, topic } = req.body;
  const existing = db.get('SELECT * FROM questions WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ message: 'Вопрос не найден' });
  const image = req.file ? `/uploads/${req.file.filename}` : existing.image;
  db.run(
    'UPDATE questions SET test_id=?, question=?, image=?, answer1=?, answer2=?, answer3=?, answer4=?, correct_answer=?, description=?, topic=? WHERE id=?',
    [test_id || null, question, image, answer1, answer2, answer3 || null, answer4 || null, correct_answer, description || '', topic || 'Общие', req.params.id]
  );
  const q = db.get('SELECT * FROM questions WHERE id = ?', [req.params.id]);
  res.json(q);
});

// Delete question (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM questions WHERE id = ?', [req.params.id]);
  res.json({ message: 'Вопрос удалён' });
});

module.exports = router;
