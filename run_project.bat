@echo off
echo Starting Heart Visualization Project...

echo Starting Backend (Port 5000)...
start "Backend" cmd /k "cd backend && ..\venv\Scripts\python app.py"

echo Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Done! Access frontend at http://localhost:5173
echo DO NOT CLOSE THIS WINDOW.
echo To stop, close the opened Backend and Frontend windows.
pause
