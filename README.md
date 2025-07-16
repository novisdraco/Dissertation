# Network Traffic Visualizer

Real-time network traffic monitoring with IDS (Intrusion Detection System) capabilities.

## 🚀 Quick Start for Windows

### Method 1: Easy Start (Double-click batch files)

1. **Download and extract** this project to your computer
2. **Double-click** `start-backend.bat` (keep this window open)
3. **Double-click** `start-frontend.bat` in a new window
4. **Open browser** to `http://localhost:3000`

### Method 2: Manual Start

1. **Install Node.js** from https://nodejs.org/ if you haven't already

2. **Start Backend** (in PowerShell/Command Prompt):
   \`\`\`cmd
   cd scripts
   npm install
   npm start
   \`\`\`

3. **Start Frontend** (in a new PowerShell/Command Prompt window):
   \`\`\`cmd
   npm install
   npm run dev
   \`\`\`

4. **Open browser** to `http://localhost:3000`

## 📊 Features

- **Real-time packet capture** and analysis
- **Network interface selection** and monitoring
- **IDS threat detection** with security alerts
- **Live connection tracking**
- **Network statistics** dashboard
- **Security threat visualization**

## 🔧 System Requirements

- **Node.js** 18+ (Download from https://nodejs.org/)
- **Windows 10/11** (or macOS/Linux)
- **Modern web browser** (Chrome, Firefox, Edge)

## 🛡️ Security Features

- Port scan detection
- DDoS attack monitoring
- Brute force attempt detection
- Suspicious traffic analysis
- Real-time threat alerts

## 📝 Usage

1. Select your network interface from the dropdown
2. Click "Start Monitoring" to begin packet capture
3. View real-time traffic in the dashboard tabs:
   - **Live Packets**: Real-time packet capture
   - **Active Connections**: Current network connections
   - **Security Threats**: IDS alerts and threats
   - **Network Map**: Visual network topology

## 🔍 Troubleshooting

**Backend won't start:**
- Make sure Node.js is installed
- Run `npm install` in the scripts folder

**Frontend shows "Disconnected":**
- Make sure the backend is running (start-backend.bat)
- Check that port 8080 is not blocked by firewall

**No network interfaces showing:**
- Try refreshing the webpage
- Restart the backend server

## 📞 Support

If you encounter any issues, check the console output in both PowerShell windows for error messages.
