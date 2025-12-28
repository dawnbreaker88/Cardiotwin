import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Zap, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const COLOR_MAP = {
    green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
    red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
};

const MetricCard = ({ label, value, unit, icon: Icon, color, delay }) => {
    const theme = COLOR_MAP[color] || COLOR_MAP.green;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-5 group hover:bg-white/10 transition-colors"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
                <Icon size={16} className={`${theme.text} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tight">
                    {value}
                </span>
                <span className="text-sm text-gray-500">{unit}</span>
            </div>
            {/* Sparkline placeholder */}
            <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${theme.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: delay + 0.2 }}
                />
            </div>
        </motion.div>
    );
};

export function MetricsPanel({ prediction, visuals }) {
    if (!prediction) return (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Awaiting analysis...
        </div>
    );

    const { class: riskClass, confidence } = prediction;
    const { heart_rate, hrv, risk_score } = visuals;

    const getRiskColorName = (level) => {
        if (level === 'High') return 'red';
        if (level === 'Medium') return 'yellow';
        return 'green';
    };

    const colorName = getRiskColorName(riskClass);
    const theme = COLOR_MAP[colorName];
    const RiskIcon = riskClass === 'High' ? AlertOctagon : riskClass === 'Medium' ? AlertTriangle : ShieldCheck;

    return (
        <div className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-2">
            <div className={`glass-card p-6 bg-gradient-to-br from-${colorName}-500/10 to-transparent border-${colorName}-500/20`}>
                <div className="flex items-center gap-3 mb-4">
                    <RiskIcon className={theme.text} size={24} />
                    <h3 className="text-lg font-semibold text-white">Risk Analysis</h3>
                </div>
                <div className="flex items-end gap-2 mb-2">
                    <span className={`text-4xl font-bold ${theme.text}`}>
                        {(risk_score * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-400 mb-1">Risk Score</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                        className={`h-2 rounded-full ${theme.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${risk_score * 100}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <MetricCard
                    label="Heart Rate"
                    value={heart_rate}
                    unit="BPM"
                    icon={Heart}
                    color="rose"
                    delay={0.1}
                />
                <MetricCard
                    label="HR Variability"
                    value={hrv}
                    unit="ms"
                    icon={Activity}
                    color="purple"
                    delay={0.2}
                />
                <MetricCard
                    label="Confidence"
                    value={(confidence * 100).toFixed(1)}
                    unit="%"
                    icon={ShieldCheck}
                    color="blue"
                    delay={0.3}
                />
            </div>
        </div>
    );
}
