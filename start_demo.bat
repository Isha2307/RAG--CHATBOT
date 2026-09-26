@echo off
title IntelliRAG - AI-Powered Document Assistant Launcher
echo =======================================================================
echo                 INTELLIRAG DEMO LAUNCHER
echo =======================================================================
echo.
echo Starting FastAPI Backend Server on port 8000...
start "IntelliRAG Backend (FastAPI)" cmd /k "cd backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo.
echo Starting Next.js Frontend Server on port 3000...
start "IntelliRAG Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================================
echo IntelliRAG is starting up!
echo - Backend API:  http://127.0.0.1:8000
echo - Frontend UI:   http://localhost:3000
echo =======================================================================
echo.
echo Opening IntelliRAG in your default web browser...
timeout /t 5 >nul
start http://localhost:3000
