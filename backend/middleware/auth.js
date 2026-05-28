const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'pdd_secret_2024';

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена авторизации' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Недействительный токен' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещён' });
    next();
  });
}

function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'pdd_secret_2024'); } catch {}
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
