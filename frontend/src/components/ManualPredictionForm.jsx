import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, User, Wind, Zap, AlertTriangle, ShieldCheck, Siren } from 'lucide-react';

const INPUTS = [
    { id: 'Age', label: 'Age', icon: User, min: 18, max: 100, step: 1 },
    { id: 'Heart_Fibrosis_Index', label: 'Fibrosis Index', icon: Heart, min: 0, max: 1, step: 0.001 },
    { id: 'Heart_Wall_Thickness_mm', label: 'Wall Thickness (mm)', icon: Heart, min: 1, max: 20, step: 0.1 },
    { id: 'Interval_No', label: 'Interval No', icon: Activity, min: 0, max: 50, step: 1 },
    { id: 'Dose_Administered_mg_m2', label: 'Dose (mg/m2)', icon: Zap, min: 0, max: 200, step: 1 },
    { id: 'ECG_QRS_Width_ms', label: 'QRS Width (ms)', icon: Activity, min: 60, max: 150, step: 1 },
    { id: 'Blood_Oxygen_SpO2', label: 'SpO2 (%)', icon: Wind, min: 80, max: 100, step: 0.1 },
    { id: 'BP_Systolic', label: 'BP Systolic', icon: Heart, min: 80, max: 200, step: 1 },
    { id: 'BP_Diastolic', label: 'BP Diastolic', icon: Heart, min: 50, max: 130, step: 1 },
];

const PRESETS = {
    Safe: {
        Age: 51, Heart_Fibrosis_Index: 0.044,
        Heart_Wall_Thickness_mm: 9.9, Interval_No: 14,
        Dose_Administered_mg_m2: 71, ECG_QRS_Width_ms: 90,
        Blood_Oxygen_SpO2: 98.0, BP_Systolic: 134, BP_Diastolic: 80
    },
    Warning: {
        Age: 59, Heart_Fibrosis_Index: 0.10,
        Heart_Wall_Thickness_mm: 10.1, Interval_No: 27,
        Dose_Administered_mg_m2: 134, ECG_QRS_Width_ms: 115,
        Blood_Oxygen_SpO2: 97.6, BP_Systolic: 147, BP_Diastolic: 88
    },
    Critical: {
        Age: 62, Heart_Fibrosis_Index: 0.15,
        Heart_Wall_Thickness_mm: 9.6, Interval_No: 28,
        Dose_Administered_mg_m2: 139, ECG_QRS_Width_ms: 132,
        Blood_Oxygen_SpO2: 88.0, BP_Systolic: 146, BP_Diastolic: 87
    }
};

export function ManualPredictionForm({ onSubmit, isLoading, initialData }) {
    const [formData, setFormData] = useState(initialData || PRESETS.Safe);

    // Update form when external initialData changes (e.g. from Patient Lookup)
    React.useEffect(() => {
        if (initialData) {
            const parsedData = { ...initialData };

            // 1. Handle BP (String "120/80" -> Sys/Dia)
            if (parsedData.Blood_Pressure_mmHg && typeof parsedData.Blood_Pressure_mmHg === 'string') {
                const parts = parsedData.Blood_Pressure_mmHg.split('/');
                if (parts.length === 2) {
                    parsedData.BP_Systolic = parseFloat(parts[0]);
                    parsedData.BP_Diastolic = parseFloat(parts[1]);
                }
            }

            setFormData(prev => ({ ...prev, ...parsedData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const loadPreset = (presetName) => {
        setFormData(PRESETS[presetName]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Quick Presets</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => loadPreset('Safe')}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/20"
                    >
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-medium">Safe</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => loadPreset('Warning')}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all border border-yellow-500/20"
                    >
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-medium">Warning</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => loadPreset('Critical')}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 animate-pulse-slow"
                    >
                        <Siren size={16} />
                        <span className="text-[10px] font-medium">Critical</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Manual Entry</h3>
                {INPUTS.map((input) => (
                    <div key={input.id} className="relative group">
                        <label className="text-xs font-medium text-gray-400 mb-1 block ml-1">
                            {input.label}
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                <input.icon size={16} />
                            </div>
                            <input
                                type="number"
                                name={input.id}
                                value={formData[input.id]}
                                onChange={handleChange}
                                min={input.min}
                                max={input.max}
                                step={input.step}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>
                ))}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-accent-gradient py-3 rounded-xl font-semibold text-white shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analyzing...' : 'Predict Risk'}
                </motion.button>
            </form>
        </div>
    );
}
