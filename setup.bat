@echo off
echo ====================================
echo Employee Management System - Setup
echo ====================================
echo.

echo Checking if Node.js is installed...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing Backend Dependencies...
cd Easy-Employee-API-master
call npm install

if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Creating Admin User...
call node create-admin.js

echo.
echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next Steps:
echo 1. Start Backend: npm run dev (in Easy-Employee-API-master folder)
echo 2. Start Frontend: npm start (in Easy-Employee-master folder)
echo 3. Open http://localhost:3001
echo.
echo Admin Credentials:
echo Email: admin@admin.com
echo Password: admin123
echo.
pause
