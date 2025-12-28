import React from 'react';

export function RiskIndicator({ prediction, visuals }) {
    if (!prediction) return null;

    const { class: riskClass, confidence } = prediction;
    const { color, heart_rate, arrhythmia_type, hrv } = visuals;

    return (
        <div className="risk-indicator" style={{ borderColor: color }}>
            <h2 style={{ color }}>Risk Level: {riskClass.toUpperCase()}</h2>

            <div className="stats-grid">
                <div className="stat">
                    <label>Confidence</label>
                    <span>{(confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="stat">
                    <label>Projected HR</label>
                    <span>{heart_rate} BPM</span>
                </div>
                <div className="stat">
                    <label>Pattern</label>
                    <span>{arrhythmia_type}</span>
                </div>
                <div className="stat">
                    <label>HRV</label>
                    <span>{hrv} ms</span>
                </div>
            </div>
        </div>
    );
}
