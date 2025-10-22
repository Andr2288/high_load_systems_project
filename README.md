# FlashEng - English Learning Application

## 📝 Опис проекту

FlashEng - веб-додаток для вивчення англійської мови з використанням флеш-карток та штучного інтелекту.

## 🔧 Технології

### Backend
- Python 3.x
- MongoDB (NoSQL database)
- JWT для аутентифікації
- bcrypt для хешування паролів

### Frontend
- React (Vite)
- React Router
- Zustand (state management)
- Tailwind CSS + DaisyUI
- Axios
- React Hot Toast

## 📁 Структура проекту

```
FLASH_ENG/
├── backend/
│   ├── database.py          # Підключення до MongoDB
│   ├── models.py            # Моделі User, UserSettings
│   ├── auth_utils.py        # JWT токени
│   ├── server.py            # HTTP сервер
│   ├── requirements.txt     # Python залежності
│   └── .env                 # Змінні оточення
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── AdminPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignUpPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── store/
    │   │   └── useAuthStore.js
    │   ├── lib/
    │   │   └── axios.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🚀 Як запустити проект

### 1. Backend

```bash
cd backend

# Встановити залежності
pip install -r requirements.txt

# Створити файл .env з вашими даними
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=your-secret-key

# Запустити сервер
python server.py
```

Сервер запуститься на `http://localhost:5001`

### 2. Frontend

```bash
cd frontend

# Встановити залежності
npm install

# Запустити проект
npm run dev
```

Фронтенд запуститься на `http://localhost:5173`

## 👥 Ролі користувачів

### User (Звичайний користувач)
- Може реєструватися через `/signup`
- Створює флеш-картки
- Проходить вправи
- Переглядає статистику

### Admin (Адміністратор)
- Має всі права User
- Може створювати користувачів (включно з іншими адмінами)
- Переглядає список всіх користувачів
- Керує системою

## 🔐 API Endpoints

### Публічні
- `POST /api/auth/signup` - Реєстрація користувача
- `POST /api/auth/login` - Вхід

### Захищені (потребують токен)
- `GET /api/auth/check` - Перевірка аутентифікації
- `GET /api/auth/me` - Отримати дані користувача

### Тільки для Admin
- `POST /api/admin/users` - Створити користувача
- `GET /api/admin/users` - Отримати всіх користувачів

## 🗄️ База даних MongoDB

### Колекції

**users:**
```json
{
  "_id": "ObjectId",
  "full_name": "string",
  "email": "string",
  "password": "string (hashed)",
  "role": "user | admin",
  "is_active": "boolean",
  "profile_picture": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**roles:**
```json
{
  "_id": "ObjectId",
  "name": "user | admin",
  "description": "string",
  "permissions": ["array of strings"]
}
```

## 🏗️ Архітектурні рішення

### 1. Чому чистий Python без фреймворків?
- **Простота** - легко зрозуміти код для початківців
- **Повний контроль** - бачимо всі деталі HTTP запитів
- **Навчання** - краще розуміння роботи веб-серверів

### 2. Чому MongoDB?
- **Гнучкість** - легко змінювати структуру даних
- **NoSQL** - підходить для флеш-карток з різними полями
- **Швидкість розробки** - не потрібні міграції

### 3. Чому JWT?
- **Stateless** - сервер не зберігає сесії
- **Безпека** - токени підписані секретним ключем
- **Простота** - легко передавати між фронтендом та бекендом

### 4. Чому Zustand?
- **Простота** - менше коду ніж Redux
- **Продуктивність** - швидкий та легкий
- **Зручність** - легко використовувати в React

## 🎨 Дизайн

Мінімалістичний дизайн з чистими формами та простою навігацією:
- Світлі тони (білий, сірий)
- Акцентні кольори (синій, фіолетовий)
- Округлі кути
- Тіні для глибини

## 📝 Перше використання

1. Запустіть бекенд та фронтенд
2. Відкрийте `http://localhost:5173`
3. Зареєструйтесь як користувач
4. Для створення адміна - використайте endpoint `/api/admin/users` з іншого адмін-акаунту

## 🔒 Безпека

- Паролі хешуються з bcrypt
- JWT токени для аутентифікації
- CORS налаштований для локальної розробки
- Валідація даних на сервері

## 📄 Ліцензія

MIT License

## 👨‍💻 Автор

FlashEng Team