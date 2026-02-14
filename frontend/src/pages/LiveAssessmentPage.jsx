import React, { useState } from 'react';
import axios from 'axios';
import { HeartCanvas } from '../components/HeartCanvas';
import { InputForm } from '../components/InputForm';
import { MetricsPanel } from '../components/MetricsPanel';
import { RiskSummaryBar } from '../components/RiskSummaryBar';
import { ChatWidget } from '../components/ChatWidget';
import { AIReportModal } from '../components/AIReportModal';
import { HeartFrame } from '../components/HeartFrame';
import { TechBackground } from '../components/TechBackground';
import { RegisterPatientModal } from '../components/RegisterPatientModal';

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

const DEFAULT_PATIENT_DATA = {
    age_years: 50,
    sex_binary: 0,
    resting_heart_rate_bpm: 70,
    systolic_bp_mmHg: 120,
    diastolic_bp_mmHg: 80,
    heart_rate_variability_rmssd: 50,
    qtc_interval_ms: 400,
    baseline_lvef_percent: 60,
    chemo_cycles_count: 0,
    dose_per_cycle_mg_per_m2: 0,
    cumulative_dose_mg_per_m2: 0
};

export const LiveAssessmentPage = () => {
    const [prediction, setPrediction] = useState(DEFAULT_PREDICTION);
    const [visuals, setVisuals] = useState(DEFAULT_VISUALS);
    const [patientData, setPatientData] = useState(DEFAULT_PATIENT_DATA);
    const [isLoading, setIsLoading] = useState(false);

    const [showReport, setShowReport] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleManualPredict = async (formData) => {
        setIsLoading(true);
        setPatientData(formData);
        try {
            const response = await axios.post('http://localhost:5000/predict', {
                features: formData,
                age_years: formData.age_years || 45
            });

            const { prediction, visuals } = response.data;
            setPrediction(prediction);
            setVisuals(visuals);
        } catch (err) {
            console.error("Prediction Error:", err);
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Backend Error: ${errorMsg}\n\nPlease ensure the analysis server is running and the model is loaded.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePatientLoaded = (data) => {
        setPatientData(data.patient_data);
        setPrediction(data.prediction);
        setVisuals(data.visuals);
    };

    const [refreshKey, setRefreshKey] = useState(0);

    const handleRegistrationSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <main className="flex-1 flex overflow-hidden pb-20 relative">
                <div className="absolute inset-x-[380px] top-0 bottom-0 z-0">
                    <TechBackground />
                </div>

                <div className="w-[380px] h-full p-0 border-r border-white/5 relative z-20 bg-bg-primary/50 backdrop-blur-sm">
                    <InputForm
                        key={refreshKey}
                        onManualSubmit={handleManualPredict}
                        onPatientLoaded={handlePatientLoaded}
                        onRegisterPatient={() => setShowRegister(true)}
                        isLoading={isLoading}
                        patientData={patientData}
                    />
                </div>

                <div className="flex-1 relative z-10 p-6 flex items-center justify-center">
                    <HeartFrame visuals={visuals}>
                        <HeartCanvas visuals={visuals} />
                    </HeartFrame>
                </div>

                <div className="w-[340px] h-full p-6 border-l border-white/5 relative z-20 bg-bg-primary/50 backdrop-blur-sm">
                    <MetricsPanel prediction={prediction} visuals={visuals} />
                </div>
            </main>

            <RiskSummaryBar
                visuals={visuals}
                onShowReport={() => setShowReport(true)}
                onOpenChat={() => setShowChat(true)}
            />

            {showReport && <AIReportModal
                onClose={() => setShowReport(false)}
                patientData={patientData}
                prediction={{ ...prediction, ...visuals }}
            />}

            <ChatWidget
                patientContext={{ patientData, visuals }}
                isOpen={showChat}
                onClose={() => setShowChat(false)}
            />

            {showRegister && (
                <RegisterPatientModal
                    onClose={() => setShowRegister(false)}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
};
