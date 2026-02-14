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
            <div className="flex flex-col items-center gap-3">
                <Activity className="animate-pulse text-gray-700" size={32} />
                <span>Awaiting analysis...</span>
            </div>
        </div>
    );

    const { class: riskClass, confidence } = prediction;
    const { heart_rate, hrv, risk_score, lvef, qtc } = visuals;

    const getRiskColorName = (level) => {
        if (level === 'Critical') return 'rose';
        if (level === 'Warning') return 'yellow';
        return 'green';
    };

    const colorName = getRiskColorName(riskClass);
    const theme = COLOR_MAP[colorName];
    const RiskIcon = riskClass === 'Critical' ? AlertOctagon : riskClass === 'Warning' ? AlertTriangle : ShieldCheck;

    return (
        <div className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">

            {/* 1. Confidence Score at the Top */}
            <MetricCard
                label="Model Confidence"
                value={(confidence * 100).toFixed(1)}
                unit="%"
                icon={ShieldCheck}
                color="blue"
                delay={0}
            />

            {/* 2. Risk Level Status (No numerical score per request) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-6 relative overflow-hidden border-${colorName}-500/30`}
            >
                {/* Decorative background glow */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${theme.bg}`} />

                <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Model Output</span>
                    <div className={`p-4 rounded-2xl mb-4 bg-white/5 border border-white/5 shadow-inner`}>
                        <RiskIcon className={theme.text} size={40} />
                    </div>
                    <h3 className={`text-3xl font-black tracking-tighter uppercase mb-2 ${theme.text}`}>
                        {riskClass}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${theme.bg}`} />
                        <span className="text-xs text-gray-400 font-medium">Risk Level Detected</span>
                    </div>
                </div>

                {/* Simplified Status Bar */}
                <div className="mt-6 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${theme.bg} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                        initial={{ width: 0 }}
                        animate={{ width: riskClass === 'Critical' ? '100%' : riskClass === 'Warning' ? '60%' : '25%' }}
                        transition={{ duration: 1.5, type: 'spring' }}
                    />
                </div>
            </motion.div>

            {/* 3. Primary Metrics */}
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
                    label="LVEF (Ejection Fraction)"
                    value={lvef ? lvef.toFixed(0) : '--'}
                    unit="%"
                    icon={Activity}
                    color="purple"
                    delay={0.2}
                />
                <MetricCard
                    label="QTc Interval"
                    value={qtc ? qtc.toFixed(0) : '--'}
                    unit="ms"
                    icon={Zap}
                    color="yellow"
                    delay={0.3}
                />
            </div>
        </div>
    );
}
