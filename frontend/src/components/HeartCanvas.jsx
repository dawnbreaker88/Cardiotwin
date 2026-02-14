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
    const { color } = visuals;

    return (
        <div className="w-full h-full relative overflow-hidden">
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
                </Suspense>
            </Canvas>
        </div>
    )
}
