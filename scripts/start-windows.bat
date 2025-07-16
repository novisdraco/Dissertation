@echo off
echo Starting Network Traffic Visualizer Backend...
echo.
echo Make sure Node.js is installed on your system.
echo If you see errors, run: npm install
echo.
echo Starting WebSocket server on port 8080...
echo Keep this window open while using the network monitor.
echo.
node network-monitor-server.js
pause
