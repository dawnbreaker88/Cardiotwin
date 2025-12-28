import React, { useState } from 'react';

const FEATURE_CONFIG = [
    { name: 'Artery_Blockage', label: 'Artery Blockage (0-3)', min: 0, max: 3, step: 1 },
    { name: 'Live_BP_Systolic', label: 'Systolic BP', min: 90, max: 200, step: 1 },
    { name: 'Cholesterol', label: 'Cholesterol', min: 100, max: 400, step: 1 },
    { name: 'Triglycerides', label: 'Triglycerides', min: 50, max: 500, step: 1 },
    { name: 'Live_ECG_ST_Depression', label: 'ECG ST Depression', min: 0, max: 5, step: 0.1 },
    { name: 'Live_PPG_SpO2', label: 'SpO2 (%)', min: 80, max: 100, step: 1 },
];

export function PatientForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        Artery_Blockage: 0,
        Live_BP_Systolic: 120,
        Cholesterol: 180,
        Triglycerides: 150,
        Live_ECG_ST_Depression: 0,
        Live_PPG_SpO2: 98,
        Live_BP_Diastolic: 80 // Default hidden
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="patient-form">
            <h3>Patient Data Input</h3>
            <div className="grid">
                {FEATURE_CONFIG.map(feature => (
                    <div key={feature.name} className="input-group">
                        <label>{feature.label}</label>
                        <input
                            type="number"
                            name={feature.name}
                            value={formData[feature.name]}
                            onChange={handleChange}
                            min={feature.min}
                            max={feature.max}
                            step={feature.step}
                            required
                        />
                    </div>
                ))}
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Predict Risk'}
            </button>
        </form>
    );
}
