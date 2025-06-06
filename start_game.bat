@echo off
REM Startup script for Cosmic Explorer Graphical Edition (Windows)

echo.
echo 🚀 Starting Cosmic Explorer Graphical Edition...
echo.

REM Check Python version
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check Python version is 3.8+
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% detected

REM Check if virtual environment exists
if not exist "venv" (
    echo.
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    echo Dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo.
    echo Creating .env file from example...
    copy .env.example .env >nul
)

REM Create saves directory if it doesn't exist
if not exist "saves" (
    echo Creating saves directory...
    mkdir saves
)

REM Start the game server
echo.
echo ✨ Launching game server...
echo 📍 Open your browser and navigate to: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the Flask app
python api\app.py
