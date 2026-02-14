import React from 'react';

export function TechBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Subtle Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                                      linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Center Vignette to focus attention */}
            <div className="absolute inset-0 bg-radial-gradient-subtle" />

            {/* Connecting Circuit Lines - SVG */}
            <div className="absolute inset-0 w-full h-full">
                <svg width="100%" height="100%">
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                    </defs>

                    {/* Left Connections */}
                    <path d="M 0,150 L 100,150 L 120,170" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M 0,300 L 80,300 L 120,340" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M 0,500 L 120,500" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />

                    {/* Right Connections */}
                    <path d="M 100%,150 L calc(100% - 100px),150 L calc(100% - 120px),170" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M 100%,300 L calc(100% - 80px),300 L calc(100% - 120px),340" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M 100%,500 L calc(100% - 120px),500" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                </svg>
            </div>
        </div>
    );
}
