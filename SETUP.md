# Детальная настройка для локального запуска

## Предварительные требования

### Node.js и npm
1. Скачайте и установите [Node.js](https://nodejs.org/) (версия 16 или выше)
2. Проверьте установку:
```bash
node --version
npm --version
```

## Пошаговая инструкция

### Шаг 1: Подготовка Base44 credentials

Чтобы приложение работало, вам нужны учетные данные Base44:

1. Перейдите на [https://base44.com](https://base44.com)
2. Войдите в свой аккаунт
3. Откройте ваш проект или создайте новый
4. В разделе **Project Settings** найдите:
   - **App ID** - уникальный идентификатор вашего приложения
   - **API Base URL** - адрес API сервера (обычно `https://api.base44.com`)
   - **Functions Version** - версия API (обычно `v1`)

### Шаг 2: Клонирование/Открытие проекта

```bash
# Если на локальном диске, просто откройте папку в терминале
cd path/to/your/project
```

### Шаг 3: Установка зависимостей

```bash
npm install
```

Это загрузит все необходимые npm пакеты из интернета в папку `node_modules`.

### Шаг 4: Создание .env.local файла

В корне проекта создайте файл `.env.local`:

**Вариант 1: Через командную строку**
```bash
# На Windows (PowerShell)
copy .env.example .env.local

# На Windows (CMD)
copy .env.example .env.local

# На Mac/Linux
cp .env.example .env.local
```

**Вариант 2: Вручную**
1. Скопируйте содержимое `.env.example`
2. Создайте новый файл `.env.local` в корне проекта
3. Вставьте содержимое и отредактируйте значения

### Шаг 5: Заполнение переменных окружения

Отредактируйте `.env.local` и замените значения:

```env
VITE_BASE44_APP_ID=вставьте_ваш_app_id_здесь
VITE_BASE44_FUNCTIONS_VERSION=v1
VITE_BASE44_APP_BASE_URL=https://api.base44.com
```

### Шаг 6: Запуск разработки

```bash
npm run dev
```

Вы должны увидеть:
```
VITE v5.x.x  building for development...

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Откройте браузер и перейдите на [http://localhost:5173](http://localhost:5173)

## Интерактивный запуск (рекомендуется для Windows)

На Windows можно создать файл `start.bat`:

```batch
@echo off
echo Установка зависимостей...
npm install

echo.
echo Копирование .env.local...
if not exist .env.local (
    copy .env.example .env.local
    echo.
    echo ВАЖНО: Отредактируйте .env.local с вашими Base44 credentials!
    echo Откройте .env.local и замените значения.
    echo.
    pause
)

echo.
echo Запуск разработки...
npm run dev

pause
```

Затем просто дважды кликните на `start.bat` для запуска.

## Проверка установки

Если вы видите сообщение об ошибке "Не может подключиться":

```bash
# 1. Проверьте, что зависимости установлены
npm list @base44/sdk

# 2. Проверьте, что .env.local существует
# Windows PowerShell
Test-Path .env.local

# 3. Попробуйте переустановить зависимости
rm -r node_modules
npm install
```

## Production сборка

Когда приложение готово к развертыванию:

```bash
# Собрать оптимизированную версию
npm run build

# Тестировать production сборку локально
npm run preview
```

Собранные файлы будут в папке `dist/`.

## Порты и адреса

- **Локальная разработка:** http://localhost:5173
- **Production API:** https://api.base44.com
- **Если 5173 занят:** Vite автоматически выберет другой port

## Полезные советы

1. **Hot Reload:** Изменения в коде автоматически обновляются в браузере
2. **DevTools:** Откройте F12 в браузере для разработки
3. **Консоль ошибок:** Проверяйте консоль браузера (F12 → Console) для ошибок
4. **Network tab:** F12 → Network для проверки API запросов

## Что дальше?

После успешного запуска:
1. Изучите структуру проекта в `README.md`
2. Проверьте примеры в `src/pages/` для понимания работы API
3. Начните разработку своих компонентов!

## Контакты и поддержка

- Base44 Документация: https://base44.com/docs
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev
