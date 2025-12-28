import React, { useState } from 'react';
import axios from 'axios';
import { HeartCanvas } from './components/HeartCanvas';
import { InputForm } from './components/InputForm';
import { MetricsPanel } from './components/MetricsPanel';
import { RiskSummaryBar } from './components/RiskSummaryBar';
import { ChatWidget } from './components/ChatWidget';
import { SettingsModal } from './components/SettingsModal';
import { AIReportModal } from './components/AIReportModal';
import { User, Settings, Sparkles } from 'lucide-react';

const DEFAULT_VISUALS = {
    heart_rate: 70,
    color: '#10B981', // green
    arrhythmia_type: 'Normal Sinus Rhythm',
    contraction_intensity: 1.0,
    hrv: 60,
    risk_level: 'Safe',
    risk_score: 0.1
};

const DEFAULT_PREDICTION = {
    class: 'Safe',
    confidence: 0.95
};

// Updated to match new dataset schema
// Updated to match new nii.csv schema
const DEFAULT_PATIENT_DATA = {
    Age: 60,
    Heart_Fibrosis_Index: 0.05,
    Heart_Wall_Thickness_mm: 10,
    Interval_No: 0,
    Dose_Administered_mg_m2: 0,
    ECG_QRS_Width_ms: 85,
    Blood_Oxygen_SpO2: 98,
    BP_Systolic: 120,
    BP_Diastolic: 80
};

function App() {
    const [prediction, setPrediction] = useState(DEFAULT_PREDICTION);
    const [visuals, setVisuals] = useState(DEFAULT_VISUALS);
    const [patientData, setPatientData] = useState(DEFAULT_PATIENT_DATA);
    const [isLoading, setIsLoading] = useState(false);

    // GenAI States
    const [showSettings, setShowSettings] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const handleManualPredict = async (formData) => {
        setIsLoading(true);
        setPatientData(formData); // Store for GenAI context
        try {
            const response = await axios.post('http://localhost:5000/predict', {
                features: formData,
                age: formData.Age || 45
            });

            const { prediction, visuals } = response.data;
            setPrediction(prediction);
            setVisuals(visuals);
        } catch (err) {
            console.error(err);
            alert('Failed to connect to backend. Please ensure the analysis server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePatientLoaded = (data) => {
        // data contains { patient_data, prediction, visuals } from backend
        setPatientData(data.patient_data);
        setPrediction(data.prediction);
        setVisuals(data.visuals);
    };

    return (
        <div className="h-screen w-screen bg-bg-primary text-white overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-bg-secondary/50 backdrop-blur-sm z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center font-bold relative animate-pulse-slow">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg tracking-tight leading-none">CardioTwin</h1>
                        <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">AI Heart Twin</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <Settings size={20} />
                    </button>
                    <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <User size={20} />
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <main className="flex-1 flex overflow-hidden pb-20"> {/* pb-20 for footer space */}

                {/* Left Sidebar - Input */}
                <div className="w-[380px] h-full p-0 border-r border-white/5 relative z-20 bg-bg-primary/50 backdrop-blur-sm">
                    <InputForm
                        onManualSubmit={handleManualPredict}
                        onPatientLoaded={handlePatientLoaded}
                        isLoading={isLoading}
                        patientData={patientData}
                    />
                </div>

                {/* Center - 3D Canvas */}
                <div className="flex-1 relative bg-black/50">
                    <HeartCanvas visuals={visuals} />
                </div>

                {/* Right Sidebar - Metrics */}
                <div className="w-[340px] h-full p-6 border-l border-white/5 relative z-20 bg-bg-primary/50 backdrop-blur-sm">
                    <MetricsPanel prediction={prediction} visuals={visuals} />
                </div>

            </main>

            {/* Fixed Footer */}
            <RiskSummaryBar visuals={visuals} onShowReport={() => setShowReport(true)} />

            {/* Overlays */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            {showReport && <AIReportModal
                onClose={() => setShowReport(false)}
                patientData={patientData}
                prediction={{ ...prediction, ...visuals }}
            />}

            {/* Chat Widget - Always available */}
            <ChatWidget patientContext={{ patientData, visuals }} />
        </div>
    );
}

export default App;
