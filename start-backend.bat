@echo off
echo Starting Network Traffic Visualizer Backend...
echo.
cd scripts
echo Installing backend dependencies...
npm install
echo.
echo Starting WebSocket server on port 8080...
echo Keep this window open while using the network monitor.
echo.
npm start
pause
