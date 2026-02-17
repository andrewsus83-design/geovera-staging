#!/bin/bash
# Simple HTTP server for reports

echo "🚀 Starting local server..."
echo ""
echo "📂 Serving: frontend/reports/"
echo "🔗 URL: http://localhost:8000"
echo ""
echo "Available reports:"
ls -1 frontend/reports/*.html | sed 's/frontend\/reports\//  • http:\/\/localhost:8000\//'
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd frontend/reports && python3 -m http.server 8000
