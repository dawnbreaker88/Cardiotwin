# 🫀 CardioTwin: AI-Powered Cardiac Digital Twin

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Three.js](https://img.shields.io/badge/Graphics-Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![ML](https://img.shields.io/badge/Model-LightGBM-brightgreen?logo=lightgbm&logoColor=white)](https://scikit-learn.org/)

**CardioTwin** is a sophisticated onco-cardiology decision support system that bridges the gap between machine learning predictions and clinical visualization. It provides real-time risk assessment for Chemotherapy-Induced Cardiotoxicity (CIC) through a high-fidelity 3D "Digital Twin" of the human heart.

---

## ✨ Key Features

### 🚀 Advanced 3D Visualization
- **Realistic Heartbeat**: Biologically accurate dual-phase animation (systole/diastole) that adjusts dynamically based on the patient's heart rate.
- **High-Tech Wireframe**: A pulsing digital overlay that syncs with the heartbeat, providing a futuristic "digital twin" aesthetic.
- **Dynamic Risk Mapping**: The heart model's color, rhythm (arrhythmia), and contraction intensity respond instantly to ML predictions.

### 🧠 Intelligent Risk Assessment
- **ML-Powered Predictions**: Uses a Random Forest classifier trained on clinical oncology data to predict risk levels (Safe, Warning, Critical).
- **Patient Management**: Securely register patients and look up their history using persistent, unique Patient IDs.
- **Interactive Metrics**: Real-time display of Vitals, ECG parameters, and model confidence scores.

### 💬 AI Documentation & Support
- **AI Report Generation**: One-click generation of comprehensive clinical reports using Google Gemini AI, available for PDF download.
- **CardioChat Assistant**: A context-aware chatbot that communicates differently with clinicians (technical) and patients (supportive).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Three.js, React Three Fiber, TailwindCSS, Framer Motion, Lucide Icons |
| **Backend** | Python, Flask, Flask-CORS, Gunicorn |
| **Machine Learning** | Scikit-learn, Pandas, Joblib, LightGBM |
| **Generative AI** | Google Gemini SDK (Flash 3 Preview) |
| **Data Storage** | Standardized CSV with Patient ID persistence |

---

## 🚀 Getting Started

### 1. Automatic Startup (Windows)
We provide a one-click script to start both services:
1. Open a terminal in the project root.
2. Initialize the environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
3. Run the project:
   ```powershell
   .\run_project.bat
   ```

### 2. Manual Installation

**Backend:**
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration

The AI features require a **Google Gemini API Key**:
1. Get a key at [ai.google.dev](https://ai.google.dev).
2. Open the application and click the **Settings** (gear) icon in the sidebar.
3. Paste your key and click **Save Configuration**.

---

## 📄 Documentation
For detailed technical info, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full system map and data flow.
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide for cloud deployment.

---

## 🔒 Security & Privacy
- **Stateless Analysis**: Predictions are processed in real-time without permanent cloud storage of medical records.
- **Config Privacy**: Sensitive API keys are stored locally in the backend and excluded from Git.

---

*Developed for Advanced Onco-Cardiology Research & Clinical Support.*
