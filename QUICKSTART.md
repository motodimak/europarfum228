# Быстрый старт для локального запуска

## ⚡ За 3 минуты до запуска

### На Windows:
```bash
# 1. Откройте терминал в папке проекта
# 2. Просто запустите:
.\start.bat

# Или вручную:
npm install
copy .env.example .env.local
npm run dev
```

### На Mac/Linux:
```bash
# 1. Откройте терминал в папке проекта  
# 2. Просто запустите:
chmod +x start.sh
./start.sh

# Или вручную:
npm install
cp .env.example .env.local
npm run dev
```

## 🔑 Получение Base44 credentials

1. Зарегистрируйтесь на [https://base44.com](https://base44.com)
2. Создайте новый проект
3. В Project Settings скопируйте:
   - **App ID** → в `VITE_BASE44_APP_ID`
   - **API URL** → в `VITE_BASE44_APP_BASE_URL`
   - **Functions Version** → обычно `v1`

## ✅ Что должно быть

```
.env.local              ← Создать и заполнить!
node_modules/           ← Создаст npm install
package.json            ← Уже есть
vite.config.js          ← Уже есть
src/                    ← Уже есть
```

## 🧪 Проверка работы

Когда сервер запущен:
1. Откройте http://localhost:5173 в браузере
2. Если видите страницу - отлично!
3. Откройте DevTools (F12) → Console
4. Если ошибок нет - всё работает

## ❌ Частые проблемы

### "Port 5173 already in use"
```bash
# Vite автоматически выберет другой, но если нужен конкретный:
npm run dev -- --port 3000
```

### "Cannot find module '@base44/sdk'"
```bash
# Переустановите зависимости:
rm -rf node_modules
npm install
```

### "Ошибка при подключении к API"
```
Проверьте .env.local:
✓ VITE_BASE44_APP_ID не пустой?
✓ VITE_BASE44_APP_BASE_URL указан?
✓ Интернет включен?
```

### "Module not found: @/..."
- Это нормально! Vite использует alias `@` для `src/`
- Если ошибка повторяется - переустановите зависимости

## 📁 Что делать дальше?

```
npm run dev       → Разработка
npm run build     → Собрать для production
npm run lint      → Проверить код
npm run lint:fix  → Исправить код автоматически
```

## 💾 Редактирование кода

1. Откройте VS Code в папке проекта
2. Отредактируйте файлы в `src/`
3. Сохраняйте (Ctrl+S)
4. Браузер обновится автоматически (HMR)

## 📚 Структура для понимания

```
src/pages/Home.jsx          ← Главная страница (примеры API)
src/components/...          ← React компоненты
src/lib/AuthContext.jsx     ← Аутентификация
src/api/base44Client.js     ← Конфигурация API
.env.local                  ← Ваши переменные (не коммитить!)
```

## 🚀 Готово?

```bash
npm run dev
# Откройте http://localhost:5173 в браузере
```

Вопросы? Проверьте [README.md](README.md) или [SETUP.md](SETUP.md)
