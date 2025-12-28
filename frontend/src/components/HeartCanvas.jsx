import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage, Sparkles, PerspectiveCamera } from '@react-three/drei'
import { HeartModel } from './HeartModel'
import * as THREE from 'three'

function AmbientParticles({ color }) {
    return (
        <Sparkles
            count={50}
            scale={10}
            size={2}
            speed={0.4}
            opacity={0.4}
            color={color}
        />
    )
}

function Rig() {
    return useFrame((state) => {
        // Subtle camera movement
        state.camera.position.lerp({ x: state.mouse.x * 2, y: state.mouse.y * 2, z: 15 }, 0.05)
        state.camera.lookAt(0, 0, 0)
    })
}

export function HeartCanvas({ visuals }) {
    const { color, risk_level } = visuals;

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* CSS Radial Gradient Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000"
                style={{
                    background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`
                }}
            />

            <Canvas shadows dpr={[1, 2]} className="relative z-10" camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <HeartModel visuals={visuals} />

                    <AmbientParticles color={color} />

                    <OrbitControls
                        makeDefault
                        enableZoom={true}
                        minDistance={2}
                        maxDistance={50}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                        enablePan={true}
                    />
                    {/* Rig disabled to allow better user control */}
                </Suspense>
            </Canvas>

            {/* Overlay Description */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 p-4 glass-card text-center pointer-events-none">
                <span className="text-xs text-gray-400 uppercase tracking-[0.2em] block mb-1">Visualization Mode</span>
                <span className="text-lg font-bold text-white">{visuals.arrhythmia_type}</span>
            </div>
        </div>
    )
}
