const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');
const SECRET = process.env.JWT_SECRET || 'pdd_secret_2024';

// Register
router.post('/register', (req, res) => {
  const { name, email, login, password } = req.body;
  if (!name || !email || !login || !password)
    return res.status(400).json({ message: 'Заполните все поля' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Пароль минимум 6 символов' });
  const existing = db.get('SELECT id FROM users WHERE email = ? OR login = ?', [email, login]);
  if (existing) return res.status(400).json({ message: 'Email или логин уже заняты' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.run('INSERT INTO users (name, email, login, password) VALUES (?, ?, ?, ?)', [name, email, login, hash]);
  const user = db.get('SELECT id, name, email, login, role FROM users WHERE id = ?', [result.lastInsertRowid]);
  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Login
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ message: 'Введите логин и пароль' });
  const user = db.get('SELECT * FROM users WHERE login = ?', [login]);
  if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Неверный пароль' });
  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = db.get('SELECT id, name, email, login, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json(user);
});

// Update profile
router.put('/update', authMiddleware, (req, res) => {
  const { name, email } = req.body;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
  const user = db.get('SELECT id, name, email, login, role FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

module.exports = router;
