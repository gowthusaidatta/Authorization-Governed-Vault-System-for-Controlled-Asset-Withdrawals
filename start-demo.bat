@echo off
REM Windows batch file to start the demo

echo 🚀 Starting Authorization-Governed Vault System Demo
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install it first.
    exit /b 1
)

echo ✓ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo ✓ Dependencies installed
echo.
echo 🌐 Starting development server...
echo 📱 Open http://localhost:3000 in your browser
echo.
echo 💡 Make sure MetaMask is installed and configured for Sepolia testnet
echo.

call npm run dev
