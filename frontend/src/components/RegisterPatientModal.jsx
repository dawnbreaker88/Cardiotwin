import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPatientModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        Patient_ID: `P${Math.floor(1000 + Math.random() * 9000)}`,
        age_years: 45,
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
    });

    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'Patient_ID' ? value : parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post('http://localhost:5000/api/register-patient', formData);
            setComplete(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-bg-secondary border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Register New Patient</h3>
                            <p className="text-xs text-gray-400">Add medical profile to clinical database</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {complete ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4"
                            >
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <h4 className="text-2xl font-bold text-white mb-2">Registration Successful</h4>
                            <p className="text-gray-400 font-mono text-sm">Patient ID: {formData.Patient_ID}</p>
                        </div>
                    ) : (
                        <>
                            {/* Personal Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                        <Fingerprint size={12} /> Patient ID
                                    </label>
                                    <input
                                        name="Patient_ID"
                                        value={formData.Patient_ID}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                                    <input
                                        type="number"
                                        name="age_years"
                                        value={formData.age_years}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Sex</label>
                                    <select
                                        name="sex_binary"
                                        value={formData.sex_binary}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                    >
                                        <option value={0} className="bg-bg-secondary">Female</option>
                                        <option value={1} className="bg-bg-secondary">Male</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Resting HR</label>
                                    <input type="number" name="resting_heart_rate_bpm" value={formData.resting_heart_rate_bpm} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Systolic BP</label>
                                    <input type="number" name="systolic_bp_mmHg" value={formData.systolic_bp_mmHg} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Diastolic BP</label>
                                    <input type="number" name="diastolic_bp_mmHg" value={formData.diastolic_bp_mmHg} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                            </div>

                            {/* Cardiological Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">HRV (RMSSD)</label>
                                    <input type="number" name="heart_rate_variability_rmssd" value={formData.heart_rate_variability_rmssd} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">QTc (ms)</label>
                                    <input type="number" name="qtc_interval_ms" value={formData.qtc_interval_ms} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Baseline LVEF (%)</label>
                                    <input type="number" name="baseline_lvef_percent" value={formData.baseline_lvef_percent} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                </div>
                            </div>

                            {/* Chemo Info */}
                            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-4">
                                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">Treatment History</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cycles</label>
                                        <input type="number" name="chemo_cycles_count" value={formData.chemo_cycles_count} onChange={handleChange} className="w-full bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Dose/Cycle</label>
                                        <input type="number" name="dose_per_cycle_mg_per_m2" value={formData.dose_per_cycle_mg_per_m2} onChange={handleChange} className="w-full bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cumulative</label>
                                        <input type="number" name="cumulative_dose_mg_per_m2" value={formData.cumulative_dose_mg_per_m2} onChange={handleChange} className="w-full bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                {!complete && (
                    <div className="p-6 border-t border-white/5 bg-white/5 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[1.5] px-4 py-3 rounded-xl bg-accent-gradient text-white font-bold shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                            Register Patient
                        </button>
                    </div>
                )}

                {error && <div className="mx-6 mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">{error}</div>}
            </motion.div>
        </div>
    );
};
