@echo off
echo Starting Nexus AI Backend Server...
start cmd /k ".\.venv\Scripts\python.exe -m uvicorn api:app --port 8000"

echo.
echo ====================================================
echo Backend started on port 8000
echo.
echo Starting Localtunnel for live URL...
echo Please copy the URL provided below and share it!
echo (If you are asked for an IP password, it's just your public IP)
echo ====================================================
echo.

npx localtunnel --port 8000
