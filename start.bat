@echo off
echo ========================================
echo    University Materials - Quick Start
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo [2/4] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Error building application!
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up admin user...
call npm run setup-admin
if %errorlevel% neq 0 (
    echo Warning: Could not setup admin user. You may need to do this manually.
)

echo.
echo [4/4] Seeding database...
call npm run seed
if %errorlevel% neq 0 (
    echo Warning: Could not seed database. You may need to do this manually.
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Firebase Console: https://console.firebase.google.com
echo 2. Enable Authentication, Firestore, and Storage
echo 3. Run: npm run dev
echo 4. Open: http://localhost:3000
echo.
echo Admin credentials:
echo Email: admin@university.edu
echo Password: admin123456
echo.
pause
