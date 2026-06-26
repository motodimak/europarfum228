# Base44 E-Commerce Application

Современное e-commerce приложение, построенное на React, Vite и Tailwind CSS с использованием Base44 платформы.

## 📋 Требования

- **Node.js** версия 16+ 
- **npm** или **yarn**
- Учетная запись Base44 с API credentials

## 🚀 Быстрый старт

### 1. Клонирование и установка зависимостей

```bash
# Перейти в директорию проекта
cd "Новая папка"

# Установить зависимости
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Затем отредактируйте `.env.local` и добавьте ваши Base44 credentials:

```env
VITE_BASE44_APP_ID=ваш_app_id
VITE_BASE44_FUNCTIONS_VERSION=v1
VITE_BASE44_APP_BASE_URL=https://api.base44.com
```

**Где получить эти значения:**
- Перейдите на [Base44 Dashboard](https://base44.com)
- Откройте свой проект
- Скопируйте **App ID** и другие необходимые параметры в раздел Settings

### 3. Запуск разработки сервера

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:5173**

## 📦 Доступные команды

| Команда | Описание |
|---------|---------|
| `npm run dev` | Запустить dev сервер с hot reload |
| `npm run build` | Собрать проект для production |
| `npm run preview` | Просмотр собранного проекта локально |
| `npm run lint` | Проверить код на ошибки |
| `npm run lint:fix` | Автоматически исправить проблемы с кодом |
| `npm run typecheck` | Проверить типы TypeScript |

## 🏗️ Структура проекта

```
src/
├── components/        # Переиспользуемые React компоненты
│   ├── ui/           # UI компоненты (Radix UI)
│   ├── cart/         # Компоненты корзины
│   ├── catalog/      # Компоненты каталога
│   ├── home/         # Компоненты главной страницы
│   ├── products/     # Компоненты продуктов
│   └── layout/       # Макеты страниц
├── pages/            # Page компоненты (маршруты)
├── api/              # API клиенты и интеграции
├── hooks/            # Пользовательские React hooks
├── lib/              # Утилиты и конфигурация
└── utils/            # Вспомогательные функции

entities/            # SQL сущности (синхронизируются с Base44)
```

## 🎯 Основные возможности

- 🛒 Каталог продуктов с фильтрацией
- 🛍️ Корзина покупок
- 💳 Checkout с Stripe интеграцией
- 👤 Аутентификация пользователей
- 📱 Мобильный адаптивный дизайн (Tailwind CSS)
- ⚡ Hot Module Replacement (HMR) для быстрой разработки

## 🔧 Технологический стек

- **Frontend:** React 18, Vite, Tailwind CSS
- **UI Components:** Radix UI
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form
- **Payments:** Stripe
- **Backend:** Base44 Platform
- **Build Tool:** Vite
- **Linting:** ESLint

## 🐛 Решение проблем

### Ошибка: "Не могу подключиться к API"
- Проверьте, что переменные в `.env.local` установлены правильно
- Убедитесь, что `VITE_BASE44_APP_ID` совпадает с вашим App ID из Base44

### Ошибка: "Port 5173 уже в использовании"
Vite автоматически выберет другой port. Если нужен конкретный port:
```bash
npm run dev -- --port 3000
```

### Очистка кэша и переустановка
```bash
# Очистить node_modules
rm -rf node_modules package-lock.json
npm install

# Очистить кэш Vite
rm -rf .vite
```

## 📚 Документация

- [Vite документация](https://vitejs.dev)
- [React документация](https://react.dev)
- [Tailwind CSS документация](https://tailwindcss.com)
- [Base44 документация](https://base44.com/docs)
- [Radix UI документация](https://radix-ui.com)

## 📝 Лицензия

Приватный проект

## 💬 Поддержка

При возникновении проблем обратитесь к документации Base44 или свяжитесь с командой поддержки.
