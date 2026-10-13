@echo off
REM Start Financial Sustainability Application
REM This script starts the Flask backend on localhost:5000

cd /d "%~dp0"
cd backend

echo Starting Financial Sustainability Application...
echo Backend will run on http://localhost:5000
echo Frontend will open in browser...

python app.py

pause
