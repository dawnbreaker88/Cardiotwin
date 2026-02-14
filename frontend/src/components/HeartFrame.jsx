import React from 'react';

export function HeartFrame({ children, visuals }) {
    // Determine border color based on risk, but keep it subtle
    const getBorderColor = () => {
        if (visuals.risk_level === 'Critical' || visuals.risk_level === 'High Risk') return 'border-red-500/20';
        if (visuals.risk_level === 'Warning' || visuals.risk_level === 'Med Risk') return 'border-yellow-500/20';
        return 'border-purple-500/20'; // Default Safe/Low Risk
    };

    return (
        <div className="relative w-full h-full p-8 flex items-center justify-center">
            {/* Main Frame Container */}
            <div className={`relative w-full h-full max-w-4xl max-h-[80vh] border ${getBorderColor()} rounded-3xl bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden transition-colors duration-1000`}>

                {/* Header Strip */}
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-6">
                    <span className="text-xs font-medium text-gray-400 tracking-wider">AI HEART MODEL</span>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${visuals.risk_level === 'Safe' ? 'bg-green-500' : visuals.risk_level === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`} />
                        <span className="text-xs font-bold text-gray-300">{visuals.arrhythmia_type}</span>
                    </div>
                </div>

                {/* Content Area (Canvas) */}
                <div className="flex-1 relative">
                    {children}

                    {/* Corner Accents */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-white/20 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-white/20 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-white/20 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-white/20 rounded-br-lg pointer-events-none" />
                </div>

                {/* Footer Strip */}
                <div className="h-10 border-t border-white/5 bg-white/5 flex items-center justify-center bg-stripes-subtle">
                    <span className="text-[10px] text-gray-500 tracking-[0.3em]">LIVE SIMULATION</span>
                </div>
            </div>
        </div>
    );
}
