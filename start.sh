#!/bin/bash
# YieldGuard Development Starter
# Starts both frontend and backend concurrently

echo "🚀 Starting YieldGuard..."

# Start API
echo "📡 Starting API on port 4000..."
cd "$(dirname "$0")/apps/api"
node dist/main.js &
API_PID=$!

# Start Frontend
echo "🌐 Starting Frontend on port 3000..."
cd "$(dirname "$0")/apps/web"
npx next dev -p 3000 &
WEB_PID=$!

# Handle shutdown
trap "kill $API_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM

echo "✅ YieldGuard running:"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:4000/api"
echo ""
echo "Press Ctrl+C to stop"

wait
