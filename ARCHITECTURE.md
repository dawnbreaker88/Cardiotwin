# CardioTwin - Complete System Architecture

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Machine Learning Pipeline](#machine-learning-pipeline)
7. [Data Flow](#data-flow)
8. [API Endpoints](#api-endpoints)
9. [Component Hierarchy](#component-hierarchy)
10. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

**CardioTwin** is an AI-powered cardiac health monitoring and visualization system that combines:
- **Machine Learning**: Random Forest classifier for cardiac risk prediction
- **3D Visualization**: Real-time heart model rendering with Three.js
- **AI Assistant**: Google Gemini-powered chatbot and report generation
- **Patient Management**: CSV-based patient data lookup and analysis

### Core Capabilities
- ✅ Real-time cardiac risk prediction (Safe/Warning/Critical)
- ✅ Interactive 3D heart visualization with dynamic parameters
- ✅ AI-generated health reports
- ✅ Conversational AI assistant for patient queries
- ✅ Patient database lookup and analysis
- ✅ Manual data entry for predictions

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + Three.js + Vite)                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/REST API (Port 5173 → 5000)
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      FLASK BACKEND API                          │
│                         (Port 5000)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Predictor   │  │ Patient Svc  │  │  GenAI Client      │   │
│  │  (ML Model)  │  │  (CSV Data)  │  │  (Gemini API)      │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│  ┌──────────────┐                                              │
│  │   Mapper     │  (Risk → Visuals)                            │
│  └──────────────┘                                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────┐      ┌──────▼──────────┐
│  ML Models   │      │  Patient Data   │
│  (.pkl)      │      │  (nii.csv)      │
└──────────────┘      └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 4.3.0 | Build tool & dev server |
| **Three.js** | 0.150.0 | 3D graphics engine |
| **@react-three/fiber** | 8.13.0 | React renderer for Three.js |
| **@react-three/drei** | 9.70.0 | Three.js helpers |
| **TailwindCSS** | 3.4.17 | Styling framework |
| **Framer Motion** | 12.23.26 | Animations |
| **Axios** | 1.4.0 | HTTP client |
| **Lucide React** | 0.562.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **jsPDF** | 3.0.4 | PDF generation |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.8+ | Runtime |
| **Flask** | Latest | Web framework |
| **Flask-CORS** | Latest | Cross-origin support |
| **scikit-learn** | Latest | ML framework |
| **pandas** | Latest | Data processing |
| **joblib** | Latest | Model serialization |
| **google-generativeai** | Latest | Gemini AI SDK |

### Machine Learning
- **Algorithm**: Random Forest Classifier
- **Features**: 9 cardiac health parameters
- **Classes**: Safe, Warning, CRITICAL_STOP
- **Preprocessing**: StandardScaler normalization
- **Imbalance Handling**: Class weights + manual oversampling

---

## 🔧 Backend Architecture

### Directory Structure
```
backend/
├── app.py                    # Flask application entry point
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── model/                    # ML artifacts
│   ├── trained_model.pkl     # Random Forest model
│   ├── scaler.pkl           # Feature scaler
│   ├── target_encoder.pkl   # Label encoder
│   ├── feature_names.pkl    # Feature list
│   ├── train_data.pkl       # Training dataset
│   ├── val_data.pkl         # Validation dataset
│   └── test_data.pkl        # Test dataset
└── utils/                    # Service modules
    ├── predictor.py         # ML prediction service
    ├── mapper.py            # Risk-to-visual mapper
    ├── patient_service.py   # Patient data service
    ├── genai_client.py      # Gemini AI client
    └── config.json          # API key storage
```

### Core Services

#### 1. **Predictor Service** (`predictor.py`)
**Responsibility**: ML model inference and preprocessing

```python
class Predictor:
    - load_artifacts()        # Load ML models
    - preprocess_input()      # Feature engineering
    - predict()               # Risk classification
```

**Key Features**:
- Loads trained Random Forest model
- Handles blood pressure parsing (120/80 → systolic/diastolic)
- Feature alignment with training schema
- Aggressive thresholding for sensitivity:
  - Critical: >30% probability
  - Warning: >40% probability
- Returns: `{class, probabilities, confidence}`

#### 2. **Patient Service** (`patient_service.py`)
**Responsibility**: Patient data management

```python
class PatientService:
    - load_data()             # Load CSV data
    - get_patient(id)         # Fetch patient by ID
    - get_all_patient_ids()   # Group by risk level
```

**Data Source**: `nii.csv` (root directory)
- Columns: Patient_ID, Age, Heart_Fibrosis_Index, Heart_Wall_Thickness, etc.
- Status_Label: Safe, Warning, CRITICAL_STOP

#### 3. **Mapper Service** (`mapper.py`)
**Responsibility**: Convert ML predictions to visual parameters

```python
def map_risk_to_visuals(prediction, age):
    return {
        heart_rate: int,           # BPM (70-120)
        color: str,                # Hex color (#4CAF50, #FFC107, #FF4444)
        arrhythmia_type: str,      # Rhythm description
        contraction_intensity: float, # 1.0-1.5
        hrv: int,                  # Heart rate variability (10-60)
        risk_score: float,         # 0.0-1.0
        risk_level: str            # Low/Medium/High
    }
```

**Mapping Logic**:
- **Safe** → Green heart, 70 BPM, Normal Sinus Rhythm
- **Warning** → Amber heart, 90 BPM, Sinus Tachycardia
- **Critical** → Red heart, 120 BPM, Atrial Fibrillation/V-Tach

#### 4. **GenAI Client** (`genai_client.py`)
**Responsibility**: Google Gemini AI integration

```python
class GenAIClient:
    - configure_key()         # Set API key
    - generate_report()       # Create health report
    - chat()                  # Conversational AI
```

**Features**:
- Model: `gemini-3-flash-preview`
- Persistent API key storage in `config.json`
- Context-aware chat with patient data
- Markdown-formatted reports

---

## 🎨 Frontend Architecture

### Directory Structure
```
frontend/
├── index.html               # Entry HTML
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Dependencies
├── public/                 # Static assets
│   └── heart.glb           # 3D heart model
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component
    ├── index.css           # Global styles
    ├── components/         # React components
    │   ├── HeartCanvas.jsx         # 3D scene container
    │   ├── HeartModel.jsx          # 3D heart mesh
    │   ├── InputForm.jsx           # Input switcher
    │   ├── PatientLookup.jsx       # Patient search
    │   ├── ManualPredictionForm.jsx # Manual input
    │   ├── MetricsPanel.jsx        # Right sidebar
    │   ├── RiskSummaryBar.jsx      # Bottom bar
    │   ├── RiskIndicator.jsx       # Risk badge
    │   ├── ChatWidget.jsx          # AI chatbot
    │   ├── AIReportModal.jsx       # Report generator
    │   └── SettingsModal.jsx       # API key config
    └── utils/              # (if any)
```

### Component Architecture

#### **App.jsx** (Root Component)
**State Management**:
```javascript
const [prediction, setPrediction]     // ML result
const [visuals, setVisuals]           // Heart parameters
const [patientData, setPatientData]   // Current patient
const [isLoading, setIsLoading]       // Loading state
const [showSettings, setShowSettings] // Modal state
const [showReport, setShowReport]     // Modal state
```

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│                      HEADER (64px)                      │
│  CardioTwin Logo | Settings | User                     │
├──────────┬─────────────────────────┬────────────────────┤
│  LEFT    │       CENTER            │      RIGHT         │
│ SIDEBAR  │    3D HEART CANVAS      │    METRICS         │
│ (380px)  │     (flex-1)            │    (340px)         │
│          │                         │                    │
│ Patient  │   Three.js Scene        │  Risk Indicator    │
│ Lookup   │   + Heart Model         │  Vitals Display    │
│   or     │   + Animations          │  Probabilities     │
│ Manual   │                         │  Recommendations   │
│ Input    │                         │                    │
├──────────┴─────────────────────────┴────────────────────┤
│              RISK SUMMARY BAR (80px)                    │
│  Risk Level | Score | Generate Report                   │
└─────────────────────────────────────────────────────────┘
                    ┌──────────────┐
                    │ CHAT WIDGET  │ (Floating)
                    └──────────────┘
```

#### **HeartCanvas.jsx** (3D Scene)
**Technology**: React Three Fiber
```jsx
<Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />
  <HeartModel visuals={visuals} />
  <OrbitControls />
</Canvas>
```

#### **HeartModel.jsx** (3D Heart)
**Dynamic Properties**:
- **Color**: Changes based on risk (green/amber/red)
- **Scale**: Pulsates with heart rate
- **Rotation**: Slow auto-rotation
- **Animation**: Contraction intensity affects scale amplitude

**Implementation**:
```javascript
useFrame(() => {
  const scale = 1 + Math.sin(Date.now() * 0.001 * heart_rate / 60) * 0.1 * contraction_intensity
  meshRef.current.scale.setScalar(scale)
})
```

#### **InputForm.jsx** (Dual Mode Input)
**Modes**:
1. **Patient Lookup**: Search by ID from database
2. **Manual Entry**: Custom parameter input

**Tabs**: Switches between `PatientLookup` and `ManualPredictionForm`

#### **MetricsPanel.jsx** (Right Sidebar)
**Displays**:
- Risk indicator badge
- Heart rate (BPM)
- Arrhythmia type
- Heart rate variability
- Blood pressure
- Risk probabilities (Safe/Warning/Critical)
- Recommendations

#### **ChatWidget.jsx** (AI Assistant)
**Features**:
- Floating button (bottom-right)
- Expandable chat window
- Context-aware responses
- Patient data injection
- Markdown rendering

#### **AIReportModal.jsx** (Report Generator)
**Features**:
- Gemini AI report generation
- Markdown rendering
- PDF download (jsPDF)
- Loading states
- Error handling

---

## 🤖 Machine Learning Pipeline

### Training Pipeline

```
┌─────────────┐
│  nii.csv    │ (Raw patient data)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  process_data.py                    │
│  - Column renaming                  │
│  - Blood pressure parsing           │
│  - Feature scaling (StandardScaler) │
│  - Train/Val/Test split (70/15/15)  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  train_model.py                     │
│  - Manual oversampling (balance)    │
│  - Random Forest training           │
│  - Validation metrics               │
│  - Feature importance analysis      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  backend/model/                     │
│  - trained_model.pkl                │
│  - scaler.pkl                       │
│  - target_encoder.pkl               │
│  - feature_names.pkl                │
└─────────────────────────────────────┘
```

### Feature Schema (9 Features)
```python
[
    'Age',                          # Years
    'Heart_Fibrosis_Index',        # 0.0-1.0
    'Heart_Wall_Thickness_mm',     # mm
    'Interval_No',                 # Treatment interval
    'Dose_Administered_mg_m2',     # Medication dose
    'ECG_QRS_Width_ms',            # ms
    'Blood_Oxygen_SpO2',           # %
    'BP_Systolic',                 # mmHg
    'BP_Diastolic'                 # mmHg
]
```

### Model Configuration
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=10,
    random_state=42,
    class_weight='balanced'
)
```

### Prediction Flow
```
User Input → Preprocessing → Scaling → Model Inference → Thresholding → Result
```

---

## 🔄 Data Flow

### 1. Manual Prediction Flow
```
┌──────────────────┐
│ User enters data │
│ in form          │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /predict               │
│ {features: {...}, age: 60}  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Predictor.predict()         │
│ - Preprocess                │
│ - Scale                     │
│ - Predict probabilities     │
│ - Apply thresholds          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ map_risk_to_visuals()       │
│ - Calculate heart rate      │
│ - Assign color              │
│ - Determine arrhythmia      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Response:                   │
│ {prediction, visuals}       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend updates:           │
│ - 3D heart (color, rate)    │
│ - Metrics panel             │
│ - Risk summary bar          │
└─────────────────────────────┘
```

### 2. Patient Lookup Flow
```
┌──────────────────┐
│ User selects     │
│ Patient ID       │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ GET /api/patient/:id        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ PatientService.get_patient()│
│ - Load from CSV             │
│ - Return patient data       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Predictor.predict()         │
│ (same as manual flow)       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Response:                   │
│ {patient_data, prediction,  │
│  visuals}                   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend:                   │
│ - Populate form             │
│ - Update 3D heart           │
│ - Show metrics              │
└─────────────────────────────┘
```

### 3. AI Report Generation Flow
```
┌──────────────────┐
│ User clicks      │
│ "Generate Report"│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/generate-report   │
│ {patient_data, prediction}  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ GenAIClient.generate_report()│
│ - Build prompt              │
│ - Call Gemini API           │
│ - Return markdown           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Response:                   │
│ {report: "# CardioTwin..."}│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend:                   │
│ - Render markdown           │
│ - Enable PDF download       │
└─────────────────────────────┘
```

### 4. Chat Flow
```
┌──────────────────┐
│ User sends       │
│ message          │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/chat              │
│ {message, history, context} │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ GenAIClient.chat()          │
│ - Inject patient context    │
│ - Send to Gemini            │
│ - Return response           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Response:                   │
│ {response: "..."}           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend:                   │
│ - Append to chat history    │
│ - Display message           │
└─────────────────────────────┘
```

---

## 🌐 API Endpoints

### Health Check
```http
GET /health
Response: {status: "healthy", service: "cardiotwin-backend"}
```

### Prediction
```http
POST /predict
Body: {
  features: {
    Age: 60,
    Heart_Fibrosis_Index: 0.05,
    Heart_Wall_Thickness_mm: 10,
    ...
  },
  age: 60
}
Response: {
  prediction: {
    class: "Safe",
    probabilities: {Safe: 0.85, Warning: 0.10, CRITICAL_STOP: 0.05},
    confidence: 0.85
  },
  visuals: {
    heart_rate: 72,
    color: "#4CAF50",
    arrhythmia_type: "Normal Sinus Rhythm",
    contraction_intensity: 1.05,
    hrv: 58,
    risk_score: 0.05,
    risk_level: "Low"
  }
}
```

### Patient List
```http
GET /api/patients
Response: {
  Safe: ["P001", "P002", ...],
  Warning: ["P050", "P051", ...],
  Critical: ["P100", "P101", ...]
}
```

### Patient Details
```http
GET /api/patient/:id
Response: {
  patient_data: {...},
  prediction: {...},
  visuals: {...}
}
```

### Configure API Key
```http
POST /api/config
Body: {api_key: "AIza..."}
Response: {status: "configured"}
```

### Generate Report
```http
POST /api/generate-report
Body: {patient_data: {...}, prediction: {...}}
Response: {report: "# CardioTwin Health Report\n\n..."}
```

### Chat
```http
POST /api/chat
Body: {
  message: "What does my heart rate mean?",
  history: [...],
  patient_context: {...}
}
Response: {response: "Your heart rate of 72 BPM is..."}
```

---

## 🧩 Component Hierarchy

```
App.jsx
├── Header
│   ├── Logo (CardioTwin)
│   ├── SettingsButton → SettingsModal
│   └── UserButton
├── Main Layout
│   ├── Left Sidebar (InputForm)
│   │   ├── Tab: PatientLookup
│   │   │   ├── Risk Group Selector
│   │   │   └── Patient Dropdown
│   │   └── Tab: ManualPredictionForm
│   │       └── Input Fields (9 features)
│   ├── Center (HeartCanvas)
│   │   └── Canvas (React Three Fiber)
│   │       ├── Lights
│   │       ├── HeartModel (GLTF)
│   │       └── OrbitControls
│   └── Right Sidebar (MetricsPanel)
│       ├── RiskIndicator
│       ├── Vital Stats
│       ├── Probability Bars
│       └── Recommendations
├── Footer (RiskSummaryBar)
│   ├── Risk Level Badge
│   ├── Risk Score
│   └── Generate Report Button → AIReportModal
├── Modals
│   ├── SettingsModal (API Key)
│   └── AIReportModal
│       ├── Report Display (Markdown)
│       └── Download PDF Button
└── ChatWidget (Floating)
    ├── Chat Button
    └── Chat Window
        ├── Message List
        └── Input Field
```

---

## 🚀 Deployment Architecture

### Local Development Setup

#### Backend
```bash
# 1. Create virtual environment
py -m venv venv

# 2. Activate environment
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Run Flask server
cd backend
python app.py
# → http://localhost:5000
```

#### Frontend
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Run dev server
npm run dev
# → http://localhost:5173
```

#### One-Click Startup (Windows)
```batch
# run_project.bat
.\venv\Scripts\activate
start cmd /k "cd backend && python app.py"
start cmd /k "cd frontend && npm run dev"
```

### Production Deployment

#### Backend (Flask)
**Options**:
1. **Gunicorn** (Linux)
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
2. **Docker**
   ```dockerfile
   FROM python:3.9
   WORKDIR /app
   COPY backend/ .
   RUN pip install -r requirements.txt
   CMD ["python", "app.py"]
   ```

#### Frontend (React)
**Build**:
```bash
npm run build
# → dist/ folder
```

**Deployment Options**:
1. **Vercel** (Recommended)
2. **Netlify**
3. **AWS S3 + CloudFront**
4. **Nginx** (serve static files)

#### Environment Variables
```bash
# Backend
GEMINI_API_KEY=your_api_key_here
PORT=5000

# Frontend (Vite)
VITE_API_URL=http://localhost:5000
```

---

## 📊 System Metrics

### Performance Characteristics
- **Model Inference Time**: ~50-100ms
- **3D Rendering**: 60 FPS (Three.js)
- **API Response Time**: <200ms
- **Gemini API Call**: 2-5 seconds
- **Frontend Bundle Size**: ~500KB (gzipped)

### Scalability Considerations
- **Backend**: Stateless (can scale horizontally)
- **ML Model**: Loaded once per instance (memory: ~3MB)
- **Patient Data**: CSV-based (consider database for >10K records)
- **Concurrent Users**: Limited by Flask (use Gunicorn workers)

---

## 🔒 Security Considerations

### Current Implementation
- ✅ CORS enabled for localhost
- ✅ API key stored in config.json (backend)
- ⚠️ No authentication/authorization
- ⚠️ No HTTPS enforcement
- ⚠️ No input validation/sanitization

### Production Recommendations
1. **Authentication**: Implement JWT or OAuth
2. **HTTPS**: Use SSL/TLS certificates
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent API abuse
5. **Secrets Management**: Use environment variables or vault
6. **CORS**: Restrict to specific domains
7. **SQL Injection**: Use parameterized queries (if migrating to DB)

---

## 🔮 Future Enhancements

### Planned Features
1. **Database Integration**: PostgreSQL/MongoDB for patient data
2. **User Authentication**: Multi-user support with roles
3. **Historical Tracking**: Store prediction history
4. **Real-time Monitoring**: WebSocket for live data
5. **Mobile App**: React Native version
6. **Advanced Visualizations**: ECG waveforms, 3D organ systems
7. **Model Improvements**: Deep learning (LSTM/CNN)
8. **Multi-language Support**: i18n
9. **Telemedicine Integration**: Video consultations
10. **Wearable Device Integration**: Apple Watch, Fitbit

### Technical Debt
- Migrate from CSV to database
- Add comprehensive unit tests
- Implement CI/CD pipeline
- Add logging and monitoring (Sentry, DataDog)
- Optimize bundle size (code splitting)
- Add accessibility features (WCAG compliance)

---

## 📝 Development Workflow

### Adding a New Feature

1. **Backend**:
   ```python
   # 1. Add endpoint in app.py
   @app.route('/api/new-feature', methods=['POST'])
   def new_feature():
       # Implementation
       pass
   
   # 2. Add service in utils/
   # 3. Update requirements.txt if needed
   ```

2. **Frontend**:
   ```jsx
   // 1. Create component in src/components/
   // 2. Add to App.jsx
   // 3. Update state management
   // 4. Style with Tailwind
   ```

3. **Testing**:
   ```bash
   # Backend
   python -m pytest tests/
   
   # Frontend
   npm run test
   ```

### Code Style
- **Python**: PEP 8
- **JavaScript**: ESLint + Prettier
- **CSS**: Tailwind utility classes

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall
```

#### 2. Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

#### 3. 3D model not loading
- Verify `public/heart.glb` exists
- Check browser console for CORS errors
- Ensure Vite dev server is running

#### 4. Gemini API errors
- Verify API key in Settings modal
- Check `backend/utils/config.json`
- Ensure model name is correct (`gemini-3-flash-preview`)

---

## 📚 References

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Scikit-learn](https://scikit-learn.org/stable/)
- [Google Gemini API](https://ai.google.dev/docs)

### Project Files
- `README.md` - Setup instructions
- `process_data.py` - Data preprocessing
- `train_model.py` - Model training
- `backend/app.py` - API server
- `frontend/src/App.jsx` - Main application

---

## 👥 Team & Contact

**Project**: CardioTwin - AI Heart Twin  
**Version**: 1.0.0  
**Last Updated**: 2026-02-02  
**Maintainer**: Prabhath  

---

**End of Architecture Document**
