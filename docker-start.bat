@echo off
echo ========================================
echo InvAI - Docker Quick Start
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Starting InvAI with Docker Compose...
echo.

REM Start Docker Compose
docker-compose up --build

pause
