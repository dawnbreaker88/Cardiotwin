import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, FileText } from 'lucide-react';

export function RiskSummaryBar({ visuals, onShowReport }) {
    if (!visuals) return null;

    const { risk_level, arrhythmia_type, color, heart_rate, hrv, risk_score } = visuals;

    const handleDownload = () => {
        const date = new Date().toLocaleString();
        const content = `
HEART RISK ANALYSIS REPORT
Date: ${date}
----------------------------------------

RISK LEVEL: ${risk_level}
Confidence: ${(visuals.confidence || 0.95) * 100}%
Risk Score: ${(risk_score * 100).toFixed(1)}%

CLINICAL METRICS:
- Heart Rate: ${heart_rate} BPM
- Arrhythmia Pattern: ${arrhythmia_type}
- HRV: ${hrv} ms

RECOMMENDATIONS:
Based on the AI prediction of ${risk_level} risk, please consult a cardiologist for further evaluation.
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Heart_Risk_Report_${date.replace(/[/:\s]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 h-20 bg-bg-primary/80 backdrop-blur-xl border-t border-white/10 flex items-center px-8 justify-between z-50"
        >
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                        style={{ color, backgroundColor: color }}
                    />
                    <span className="text-xl font-bold tracking-widest uppercase" style={{ color }}>
                        {risk_level} RISK
                    </span>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Pattern Detected</span>
                    <span className="text-sm font-medium text-gray-200">{arrhythmia_type}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 mr-4 hidden md:block">
                    *AI prediction based on input vitals
                </span>
                <button
                    onClick={onShowReport}
                    className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors text-white font-medium shadow-lg shadow-purple-900/20"
                >
                    <FileText size={18} />
                    <span>AI Analysis</span>
                </button>
                <button
                    onClick={handleDownload}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    title="Download Summary"
                >
                    <Download size={20} />
                </button>
            </div>
        </motion.div>
    );
}
