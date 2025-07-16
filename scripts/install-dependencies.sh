#!/bin/bash

echo "Installing Network Monitor Dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Install Node.js dependencies
cd scripts
echo "Installing npm dependencies..."
npm install

echo ""
echo "Dependencies installed successfully!"
echo ""
echo "🚀 To start the real network monitor backend:"
echo "   cd scripts"
echo "   npm start"
echo ""
echo "📡 The WebSocket server will run on ws://localhost:8080"
echo ""
echo "⚠️  For enhanced packet capture capabilities:"
echo "   • Linux/macOS: Run with sudo for raw packet access"
echo "   • Windows: Install Wireshark/npcap for packet capture"
echo "   • Install tcpdump or tshark for advanced monitoring"
echo ""
echo "🔍 Current implementation includes:"
echo "   • Real network interface detection"
echo "   • Simulated realistic packet data"
echo "   • Live connection monitoring via netstat"
echo "   • IDS threat detection simulation"
