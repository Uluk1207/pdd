const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { adminMiddleware } = require('../middleware/auth');

// GET /admin/questions?page=1&search=&testId=
router.get('/questions', adminMiddleware, (req, res) => {
  const page   = parseInt(req.query.page) || 1;
  const limit  = 20;
  const offset = (page - 1) * limit;
  const search = req.query.search ? '%' + req.query.search + '%' : '%';
  const testId = req.query.testId ? parseInt(req.query.testId) : null;

  let whereParts = ['q.question LIKE ?'];
  let params     = [search];

  if (testId) {
    whereParts.push('q.test_id = ?');
    params.push(testId);
  }

  const where = 'WHERE ' + whereParts.join(' AND ');

  const totalRow = db.get(
    `SELECT COUNT(*) as cnt FROM questions q ${where}`,
    params
  );
  const questions = db.all(
    `SELECT q.*, t.title as test_title
     FROM questions q
     LEFT JOIN tests t ON q.test_id = t.id
     ${where}
     ORDER BY q.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    questions,
    total: totalRow.cnt,
    page,
    pages: Math.ceil(totalRow.cnt / limit)
  });
});

// All users
router.get('/users', adminMiddleware, (req, res) => {
  const users = db.all(
    'SELECT id, name, email, login, role, created_at FROM users ORDER BY id',
    []
  );
  res.json(users);
});

// Update user
router.put('/users/:id', adminMiddleware, (req, res) => {
  const { name, email, role } = req.body;
  db.run(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, req.params.id]
  );
  const user = db.get(
    'SELECT id, name, email, login, role FROM users WHERE id = ?',
    [req.params.id]
  );
  res.json(user);
});

// Delete user
router.delete('/users/:id', adminMiddleware, (req, res) => {
  const user = db.get('SELECT role FROM users WHERE id = ?', [req.params.id]);
  if (user && user.role === 'admin')
    return res.status(403).json({ message: 'Нельзя удалить администратора' });
  db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'Пользователь удалён' });
});

// All results
router.get('/results', adminMiddleware, (req, res) => {
  const results = db.all(
    `SELECT r.*, u.name, u.login
     FROM results r
     JOIN users u ON r.user_id = u.id
     ORDER BY r.date DESC LIMIT 100`,
    []
  );
  res.json(results);
});

module.exports = router;
