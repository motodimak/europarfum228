#!/bin/bash

# Base44 E-Commerce Application - Quick Start Script for Mac/Linux

echo ""
echo "========================================"
echo "  Base44 E-Commerce App - Local Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js не установлен!"
    echo "Пожалуйста, установите Node.js с https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js найден:"
node --version

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "! Файл .env.local не найден"
    echo "Копирование из .env.example..."
    cp .env.example .env.local
    echo "✓ Создан .env.local"
    echo ""
    echo "ВАЖНО: Откройте .env.local и заполните:"
    echo "  - VITE_BASE44_APP_ID"
    echo "  - VITE_BASE44_APP_BASE_URL"
    echo ""
    echo "Если вы не заполните эти значения, приложение не будет работать!"
    echo ""
    read -p "Нажмите Enter для продолжения..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Установка зависимостей npm..."
    echo "(Это может занять несколько минут)"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Ошибка при установке зависимостей"
        exit 1
    fi
    echo "✓ Зависимости установлены"
else
    echo "✓ Зависимости уже установлены"
fi

echo ""
echo "========================================"
echo "   Запуск разработки..."
echo "========================================"
echo ""
echo "Приложение откроется на http://localhost:5173"
echo "Нажмите Ctrl+C для остановки сервера"
echo ""

npm run dev
