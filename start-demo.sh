#!/bin/bash

echo "🚀 Starting Authorization-Governed Vault System Demo"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✓ Node.js detected"

# Install dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✓ Dependencies installed"
echo ""
echo "🌐 Starting development server..."
echo "📱 Open http://localhost:3000 in your browser"
echo ""
echo "💡 Make sure MetaMask is installed and configured for Sepolia testnet"
echo ""

npm run dev
