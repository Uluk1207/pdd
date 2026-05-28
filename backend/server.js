const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb } = require('./models/db');
const initDB = require('./models/init');

const app = express();
const PORT = 3000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function start() {
  await initDb();
  initDB();

  app.use('/api/auth',      require('./routes/auth'));
  app.use('/api/tests',     require('./routes/tests'));
  app.use('/api/questions', require('./routes/questions'));
  app.use('/api/results',   require('./routes/results'));
  app.use('/api/mistakes',  require('./routes/mistakes'));
  app.use('/api/stats',     require('./routes/stats'));
  app.use('/api/admin',     require('./routes/admin'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  });

  app.listen(PORT, () => {
    console.log(`\n🚗 ПДД Онлайн запущен!`);
    console.log(`📡 Сервер: http://localhost:${PORT}`);
    console.log(`👤 Демо-пользователь: user / user123`);
    console.log(`🔑 Демо-админ: admin / admin123\n`);
  });
}

start().catch(console.error);
module.exports = app;
