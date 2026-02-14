import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ManualPredictionForm({ onSubmit, isLoading, initialData }) {
    const [formData, setFormData] = useState(initialData || {});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors";
    const labelClasses = "block text-xs font-medium text-gray-400 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">

            {/* Demographics */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Age (years)</label>
                    <input
                        type="number"
                        name="age_years"
                        value={formData.age_years}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Sex</label>
                    <select
                        name="sex_binary"
                        value={formData.sex_binary}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value={0}>Female</option>
                        <option value={1}>Male</option>
                    </select>
                </div>
            </div>

            {/* Vitals */}
            <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Vitals</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Resting HR (bpm)</label>
                        <input
                            type="number"
                            name="resting_heart_rate_bpm"
                            value={formData.resting_heart_rate_bpm}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>HRV (RMSSD)</label>
                        <input
                            type="number"
                            name="heart_rate_variability_rmssd"
                            value={formData.heart_rate_variability_rmssd}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Systolic BP</label>
                        <input
                            type="number"
                            name="systolic_bp_mmHg"
                            value={formData.systolic_bp_mmHg}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Diastolic BP</label>
                        <input
                            type="number"
                            name="diastolic_bp_mmHg"
                            value={formData.diastolic_bp_mmHg}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            {/* Cardiac */}
            <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Cardiac Function</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>QTc Interval (ms)</label>
                        <input
                            type="number"
                            name="qtc_interval_ms"
                            value={formData.qtc_interval_ms}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>LVEF (%)</label>
                        <input
                            type="number"
                            name="baseline_lvef_percent"
                            value={formData.baseline_lvef_percent}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            {/* Treatment */}
            <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Treatment</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Chemo Cycles</label>
                        <input
                            type="number"
                            name="chemo_cycles_count"
                            value={formData.chemo_cycles_count}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Dose/Cycle (mg/m²)</label>
                        <input
                            type="number"
                            name="dose_per_cycle_mg_per_m2"
                            value={formData.dose_per_cycle_mg_per_m2}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Cumulative Dose (mg/m²)</label>
                    <input
                        type="number"
                        name="cumulative_dose_mg_per_m2"
                        value={formData.cumulative_dose_mg_per_m2}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-accent-gradient py-3 rounded-xl font-semibold text-white shadow-lg shadow-purple-900/20 disabled:opacity-50"
            >
                {isLoading ? 'Analyzing...' : 'Predict Risk'}
            </motion.button>
        </form>
    );
}
