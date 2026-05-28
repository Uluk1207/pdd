const bcrypt = require('bcryptjs');
const db = require('./db');

function initDB() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'ticket',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER,
      question TEXT NOT NULL,
      image TEXT,
      answer1 TEXT NOT NULL,
      answer2 TEXT NOT NULL,
      answer3 TEXT,
      answer4 TEXT,
      correct_answer INTEGER NOT NULL,
      description TEXT,
      topic TEXT,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_id INTEGER,
      title TEXT,
      score INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  // Seed admin
  const adminExists = db.get('SELECT id FROM users WHERE login = ?', ['admin']);
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (name, email, login, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Администратор', 'admin@pdd.ru', 'admin', hash, 'admin']);
    console.log('✅ Создан admin: admin / admin123');
  }

  // Seed demo user
  const userExists = db.get('SELECT id FROM users WHERE login = ?', ['user']);
  if (!userExists) {
    const hash = bcrypt.hashSync('user123', 10);
    db.run('INSERT INTO users (name, email, login, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Пользователь', 'user@pdd.ru', 'user', hash, 'user']);
    console.log('✅ Создан demo user: user / user123');
  }

  // Seed tickets
  const testCount = db.get('SELECT COUNT(*) as cnt FROM tests', []);
  if (!testCount || testCount.cnt === 0) {
    seedTests();
  }
}

const QUESTIONS = [
  { q: 'Что означает мигающий зелёный сигнал светофора?', a1:'Движение разрешено', a2:'Движение запрещено', a3:'Разрешено, но сигнал скоро сменится', a4:'Уступите дорогу', c:3, d:'Мигающий зелёный предупреждает о скором переключении на жёлтый.', t:'Светофоры' },
  { q: 'На каком расстоянии до пешеходного перехода запрещена стоянка?', a1:'3 метра', a2:'5 метров', a3:'10 метров', a4:'15 метров', c:2, d:'ПДД запрещают стоянку ближе 5 метров до пешеходного перехода.', t:'Парковка' },
  { q: 'Кто имеет преимущество на перекрёстке равнозначных дорог?', a1:'Тот, кто едет прямо', a2:'Тот, кто едет быстрее', a3:'Помеха справа', a4:'Более крупный транспорт', c:3, d:'На равнозначном перекрёстке уступайте помехе справа.', t:'Перекрёстки' },
  { q: 'Какой минимальный возраст для управления легковым автомобилем?', a1:'16 лет', a2:'17 лет', a3:'18 лет', a4:'21 год', c:3, d:'Категория B выдаётся с 18 лет.', t:'Общие положения' },
  { q: 'Что запрещено при обгоне через сплошную линию?', a1:'Опережение', a2:'Выезд на встречную полосу', a3:'Превышение скорости', a4:'Все варианты', c:2, d:'Выезд на встречную полосу через сплошную запрещён.', t:'Обгон' },
  { q: 'Какой знак обозначает главную дорогу?', a1:'Треугольник', a2:'Жёлтый ромб', a3:'Синий круг', a4:'Прямоугольник', c:2, d:'Главная дорога обозначается жёлтым ромбом.', t:'Знаки' },
  { q: 'Где запрещён обгон?', a1:'На прямом участке', a2:'На подъёме', a3:'На регулируемом перекрёстке', a4:'На дороге с 2 полосами', c:3, d:'Обгон запрещён на регулируемых перекрёстках.', t:'Обгон' },
  { q: 'Максимальная скорость в населённом пункте?', a1:'40 км/ч', a2:'50 км/ч', a3:'60 км/ч', a4:'70 км/ч', c:3, d:'В населённых пунктах ограничение 60 км/ч.', t:'Скорость' },
  { q: 'Что обозначает сплошная белая линия разметки?', a1:'Можно пересекать', a2:'Нельзя пересекать', a3:'Разделяет полосы', a4:'Пешеходный переход', c:2, d:'Сплошная линия запрещает пересечение.', t:'Разметка' },
  { q: 'Как поступить при приближении скорой помощи?', a1:'Продолжать движение', a2:'Остановиться', a3:'Уступить, прижавшись к обочине', a4:'Сигналить', c:3, d:'Необходимо уступить дорогу экстренным службам.', t:'Общие положения' },
  { q: 'На каком расстоянии переключают дальний свет при встречном разъезде?', a1:'50 м', a2:'100 м', a3:'150 м', a4:'200 м', c:3, d:'Переключайтесь на ближний свет за 150 м до встречного ТС.', t:'Световые приборы' },
  { q: 'Кто обязан пропустить пешехода на зебре?', a1:'Только легковые', a2:'Все ТС', a3:'Только тихоходные', a4:'Никто', c:2, d:'Все ТС обязаны уступать пешеходам на переходе.', t:'Пешеходы' },
  { q: 'Что означает знак «Уступи дорогу»?', a1:'Остановитесь', a2:'Снизьте скорость', a3:'Уступите транспорту на перекрёстке', a4:'Поворот запрещён', c:3, d:'Знак обязывает пропустить всех участников движения.', t:'Знаки' },
  { q: 'Когда разрешён звуковой сигнал вне нас. пункта?', a1:'Всегда', a2:'Только ночью', a3:'Для предупреждения об обгоне', a4:'Запрещён', c:3, d:'Вне населённых пунктов сигнал разрешён для предупреждения.', t:'Общие положения' },
  { q: 'Остановочная дистанция при 60 км/ч на сухой дороге?', a1:'15–20 м', a2:'25–30 м', a3:'35–40 м', a4:'50–60 м', c:3, d:'При 60 км/ч тормозной путь около 35-40 метров.', t:'Скорость' },
  { q: 'Разрешено ли движение по тротуару на мотоцикле?', a1:'Да', a2:'Только тихоходный', a3:'Нет, запрещено', a4:'С разрешения ГИБДД', c:3, d:'Движение ТС по тротуарам запрещено.', t:'Общие положения' },
  { q: 'Что такое «мёртвая зона» зеркал?', a1:'Зона позади авто', a2:'Область, не видимая в зеркалах', a3:'Слепая зона светофора', a4:'Зона разворота', c:2, d:'Мёртвая зона — область, не отображаемая ни одним зеркалом.', t:'Общие положения' },
  { q: 'Как обозначается конец зоны запрета обгона?', a1:'Красным кругом', a2:'Белым прямоугольником', a3:'Белой линией', a4:'Знаком 3.21', c:4, d:'Конец запретной зоны обозначается знаком 3.21.', t:'Знаки' },
  { q: 'Разрешено ли управлять ТС в состоянии алкогольного опьянения?', a1:'При 0.3 промилле', a2:'На короткое расстояние', a3:'Нет, строго запрещено', a4:'С сопровождающим', c:3, d:'Управление ТС в нетрезвом виде строго запрещено.', t:'Общие положения' },
  { q: 'Что означает мигающий жёлтый сигнал светофора?', a1:'Движение запрещено', a2:'Нерегулируемый перекрёсток, будьте осторожны', a3:'Уступите дорогу', a4:'Разворот разрешён', c:2, d:'Мигающий жёлтый означает нерегулируемый перекрёсток.', t:'Светофоры' },
];

function seedTests() {
  for (let t = 1; t <= 35; t++) {
    const res = db.run('INSERT INTO tests (title, category) VALUES (?, ?)', [`Билет ${t}`, 'ticket']);
    const testId = res.lastInsertRowid;
    // pick 20 questions cycling through pool
    for (let i = 0; i < 20; i++) {
      const q = QUESTIONS[(i + t) % QUESTIONS.length];
      db.run(
        'INSERT INTO questions (test_id, question, answer1, answer2, answer3, answer4, correct_answer, description, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [testId, q.q, q.a1, q.a2, q.a3, q.a4, q.c, q.d, q.t]
      );
    }
  }
  console.log('✅ 35 билетов с вопросами созданы');
}

module.exports = initDB;
