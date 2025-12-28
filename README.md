# Heart Visualization Project

3D heart visualization system connected to ML-based cardiac risk prediction.

## Structure
- `backend/`: Flask API and ML model
- `frontend/`: React + Three.js visualization

## Prerequisites
- Python 3.8+
- Node.js 16+

## Setup & Run

### 1. Automatic Setup (Windows)
We have provided a one-click startup script:
1. Open a terminal in the project root.
2. Create the python virtual environment (Required once):
   ```bash
   py -m venv venv
   .\venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
3. Run the project:
   Double-click `run_project.bat` or run it from the terminal:
   ```cmd
   .\run_project.bat
   ```

### 2. Manual Setup

**Backend:**
```bash
cd backend
# Create virtual env if you haven't
python -m venv ../venv 
../venv/Scripts/activate
pip install -r requirements.txt
python app.py
```
Server runs on: http://localhost:5000

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Client runs on: http://localhost:5173

## Configuration
- **Gemini API Key**: The application uses Google's Gemini-3 Flash model for report generation. You will be prompted to enter your API key in the UI, or you can set it as an environment variable `GEMINI_API_KEY`.
