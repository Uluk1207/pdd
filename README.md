# 🚗 ПДД Онлайн

Полнофункциональный сайт для подготовки к экзамену по ПДД Кыргызстана (аналог Joldo.kg).

## Быстрый старт

```bash
cd backend
npm install
node server.js
```

Откройте: **http://localhost:3000**

## Демо-аккаунты

| Роль | Логин | Пароль |
|------|-------|--------|
| 🔑 Администратор | `admin` | `admin123` |
| 👤 Пользователь | `user` | `user123` |

## Режимы тестирования

- **📋 Билеты** — 35 билетов по 20 вопросов каждый
- **📚 Темы** — вопросы по темам ПДД (обгон, знаки, перекрёстки...)
- **📝 Экзамен** — 20 случайных вопросов, 25 минут, нужно ≥75%
- **🏃 Марафон** — все вопросы без ограничений
- **❌ Мои ошибки** — повторение вопросов, на которые отвечали неверно

## Структура проекта

```
project/
├── frontend/           # Статические HTML-страницы
│   ├── index.html      # Главная
│   ├── login.html      # Вход / Регистрация
│   ├── profile.html    # Личный кабинет
│   ├── test.html       # Универсальная страница теста
│   ├── tickets.html    # Список из 35 билетов
│   ├── topics.html     # Темы ПДД
│   ├── exam.html       # Экзамен
│   ├── marathon.html   # Марафон
│   ├── mistakes.html   # Мои ошибки
│   ├── stats.html      # Статистика
│   ├── rating.html     # Рейтинг пользователей
│   ├── admin.html      # Панель администратора
│   ├── css/
│   │   ├── style.css   # Основные стили
│   │   └── admin.css   # Стили для админки
│   └── js/
│       └── app.js      # Общие утилиты (api, auth, toast)
├── backend/
│   ├── server.js           # Express-сервер (порт 3000)
│   ├── package.json
│   ├── models/
│   │   ├── db.js           # Обёртка над sql.js (SQLite)
│   │   └── init.js         # Создание таблиц и начальные данные
│   ├── middleware/
│   │   └── auth.js         # JWT-авторизация
│   └── routes/
│       ├── auth.js         # POST /register, POST /login, GET /me
│       ├── tests.js        # CRUD для билетов
│       ├── questions.js    # Вопросы по билету, теме, случайные
│       ├── results.js      # Сохранение и получение результатов
│       ├── mistakes.js     # Управление ошибками пользователя
│       ├── stats.js        # Публичная статистика, рейтинг
│       └── admin.js        # Управление пользователями (CRUD)
├── database/
│   └── database.db     # SQLite БД (создаётся автоматически)
└── uploads/            # Загруженные изображения к вопросам
```

## API

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход, возвращает JWT |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/tests?category=ticket` | Список билетов |
| GET | `/api/questions/by-test/:id` | Вопросы билета |
| GET | `/api/questions/random?limit=20` | Случайные вопросы |
| GET | `/api/questions/by-topic/:topic` | Вопросы по теме |
| POST | `/api/results/save` | Сохранить результат |
| GET | `/api/results/my` | Мои результаты |
| POST | `/api/mistakes/add` | Добавить ошибку |
| GET | `/api/mistakes/questions` | Мои вопросы с ошибками |
| DELETE | `/api/mistakes/clear` | Очистить ошибки |
| GET | `/api/stats/public` | Общая статистика |
| GET | `/api/stats/rating` | Таблица лидеров |

## Технологии

- **Frontend**: HTML5, CSS3, Vanilla JS (без фреймворков)
- **Backend**: Node.js + Express.js
- **БД**: SQLite через [sql.js](https://github.com/sql-js/sql.js) (pure JS, без компиляции)
- **Авторизация**: JWT + bcryptjs
- **Загрузка файлов**: multer

## Добавление своих вопросов

1. Войдите как `admin`
2. Откройте **Панель администратора** → вкладка **Вопросы**
3. Нажмите **Добавить вопрос**
4. Можно прикрепить изображение к вопросу

## Требования

- Node.js 16+
- npm

> **Примечание**: проект использует `sql.js` вместо `better-sqlite3`, поэтому работает без нативной компиляции на любой ОС.
# pdd
