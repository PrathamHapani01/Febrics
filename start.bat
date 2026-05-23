@echo off
title Maison Lin - Fabric Website
cd /d "%~dp0backend"

echo Installing dependencies (first time only)...
pip install -r requirements.txt -q

if not exist ".env" (
    echo.
    echo No .env file found. Running database setup...
    python setup_local.py
    if errorlevel 1 (
        echo Setup failed. Fix PostgreSQL connection and run: python setup_local.py
        pause
        exit /b 1
    )
)

echo.
echo Starting server...
echo.
echo   Open in browser:  http://127.0.0.1:5000
echo   Shop page:        http://127.0.0.1:5000/shop.html
echo   Admin page:       http://127.0.0.1:5000/admin.html
echo.
echo   Admin login:  Pratham  /  Lollipop069
echo.
echo   Press Ctrl+C to stop the server.
echo.

python app.py
pause
