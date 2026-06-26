@echo off
REM Base44 E-Commerce Application - Quick Start Script for Windows

echo.
echo ========================================
echo   Base44 E-Commerce App - Local Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js не установлен!
    echo Пожалуйста, установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js найден: 
node --version

REM Check if .env.local exists
if not exist .env.local (
    echo.
    echo ! Файл .env.local не найден
    echo Копирование из .env.example...
    copy .env.example .env.local
    echo ✓ Создан .env.local
    echo.
    echo ВАЖНО: Откройте .env.local и заполните:
    echo   - VITE_BASE44_APP_ID
    echo   - VITE_BASE44_APP_BASE_URL
    echo.
    echo Если вы не заполните эти значения, приложение не будет работать!
    echo.
    pause
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo Установка зависимостей npm...
    echo (Это может занять несколько минут)
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Ошибка при установке зависимостей
        pause
        exit /b 1
    )
    echo ✓ Зависимости установлены
) else (
    echo ✓ Зависимости уже установлены
)

echo.
echo ========================================
echo   Запуск разработки...
echo ========================================
echo.
echo Приложение откроется на http://localhost:5173
echo Нажмите Ctrl+C для остановки сервера
echo.
pause

call npm run dev
