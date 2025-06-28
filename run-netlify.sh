#!/bin/bash

# 🚀 تشغيل موقع لبيه مع Netlify Dev
# بدون Express Backend - فقط Serverless Functions

echo "🚀 بدء تشغيل موقع لبيه..."
echo "📦 التحقق من التبعيات..."

# التحقق من Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI غير مثبت!"
    echo "📥 تثبيت Netlify CLI..."
    npm install -g netlify-cli
fi

# التحقق من Node modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت تبعيات الجذر..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 تثبيت تبعيات Frontend..."
    cd frontend && npm install && cd ..
fi

echo "✅ التبعيات جاهزة!"
echo ""
echo "🔥 بدء تشغيل Netlify Dev..."
echo "📍 الموقع سيعمل على: http://localhost:8888"
echo "🌐 API متاح على: http://localhost:8888/.netlify/functions/"
echo ""
echo "⚡ اضغط Ctrl+C لإيقاف الخادم"
echo "───────────────────────────────────────"

# تشغيل Netlify Dev
netlify dev 