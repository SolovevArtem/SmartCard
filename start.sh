#!/bin/bash

echo "🚀 Запуск ВидеоМиг MVP..."
echo ""

# Проверка установки Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 16+ и попробуйте снова."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Установка зависимостей для backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Установка зависимостей backend..."
    cd backend && npm install && cd ..
    echo "✅ Backend зависимости установлены"
    echo ""
fi

# Установка зависимостей для frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Установка зависимостей frontend..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend зависимости установлены"
    echo ""
fi

# Запуск backend в фоне
echo "🔧 Запуск backend на порту 3001..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Ждем запуска backend
sleep 3

# Запуск frontend
echo "🎨 Запуск frontend на порту 3000..."
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ ВидеоМиг запущен!"
echo ""
echo "📱 Откройте: http://localhost:3000"
echo "🔌 API доступен на: http://localhost:3001"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Ждем прерывания
wait
