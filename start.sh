#!/bin/bash

# HO-CARE Development Server Startup Script
echo "🚀 Starting HO-CARE Development Servers..."
echo "=========================================="

# Kill any existing processes on ports 3001 and 5173-5179
echo "🔄 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
lsof -ti:5175 | xargs kill -9 2>/dev/null || true
lsof -ti:5176 | xargs kill -9 2>/dev/null || true
lsof -ti:5177 | xargs kill -9 2>/dev/null || true
lsof -ti:5178 | xargs kill -9 2>/dev/null || true
lsof -ti:5179 | xargs kill -9 2>/dev/null || true

sleep 2

# Start Backend Server
echo "🖥️  Starting Backend Server (Port 3001)..."
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend Server
echo "🌐 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for servers to initialize
sleep 5

echo ""
echo "✅ Servers Started Successfully!"
echo "================================"
echo "🖥️  Backend API: http://localhost:3001"
echo "🌐 Frontend:    http://localhost:5173 (or next available port)"
echo ""
echo "📱 Features Available:"
echo "   • Modern UI with Cyan/Turquoise theme"
echo "   • Responsive design for all devices"
echo "   • Professional service booking system"
echo "   • Admin dashboard at /dashboard"
echo ""
echo "🔑 Admin Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚡ Quick Access URLs:"
echo "   • Home: http://localhost:5173/"
echo "   • Services: http://localhost:5173/services"
echo "   • About: http://localhost:5173/about"
echo "   • Contact: http://localhost:5173/contact"
echo "   • Dashboard: http://localhost:5173/dashboard"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Kill any remaining processes
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    lsof -ti:5175 | xargs kill -9 2>/dev/null || true
    lsof -ti:5176 | xargs kill -9 2>/dev/null || true
    lsof -ti:5177 | xargs kill -9 2>/dev/null || true
    lsof -ti:5178 | xargs kill -9 2>/dev/null || true
    lsof -ti:5179 | xargs kill -9 2>/dev/null || true
    
    echo "✅ All servers stopped successfully!"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup INT TERM

# Keep script running
wait 