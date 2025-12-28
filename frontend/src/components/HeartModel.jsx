import React, { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Preload the model
// Adjust path to match the directory found
const MODEL_PATH = '/models/cardiac_anatomy_external_view_of_human_heart/scene.gltf'

export function HeartModel({ visuals }) {
    const group = useRef()
    const { nodes, materials, scene } = useGLTF(MODEL_PATH)

    // Clone the scene to avoid mutation issues if used multiple times
    const clonedScene = React.useMemo(() => scene.clone(), [scene])

    // Refs for animation
    const timeRef = useRef(0)
    const scaleBase = useRef(new THREE.Vector3(1, 1, 1))

    // Destructure visuals
    const {
        heart_rate,          // BPM
        color,               // Hex string
        contraction_intensity, // Scale factor (e.g. 1.0 - 1.2)
        arrhythmia_type      // String
    } = visuals

    // Calculate beat frequency (beats per second)
    // BPM / 60 = Hz
    const frequency = heart_rate / 60.0

    useFrame((state, delta) => {
        if (!group.current) return

        timeRef.current += delta

        // Base heartbeat calculation (Sine wave)
        // 0 to 1 range
        let beat = Math.sin(timeRef.current * frequency * Math.PI * 2)

        // Simulate different rhythms
        if (arrhythmia_type === "Atrial Fibrillation") {
            // Irregular: Add random noise to phase
            beat = Math.sin(timeRef.current * frequency * Math.PI * 2 + Math.random() * 0.5)
        }
        else if (arrhythmia_type === "Premature Ventricular Contractions") {
            // Occasional skipped/double beat logic roughly simulated by complex wave
            beat = Math.sin(timeRef.current * frequency * Math.PI * 2) + Math.sin(timeRef.current * frequency * 0.5) * 0.2
        }

        // Contraction (Scale) logic
        // We want the heart to shrink (contract) and expand (relax)
        // Map beat (-1 to 1) to Scale
        // Normal scale is 0.05 (based on likely model size, we'll need to adjust initial scale)
        const baseScale = 20.0 // Increased from 0.5

        // Contraction: when beat is high, heart is compressed? 
        // Usually systole (contraction) is rapid.

        // Simple pulsating effect:
        // Scale varies between 1.0 and (1.0 - intensity * 0.1)
        const scaleFactor = 1.0 + (beat * 0.05 * contraction_intensity)

        group.current.scale.set(
            20.0 * scaleFactor,
            20.0 * scaleFactor,
            20.0 * scaleFactor
        )

        // Color tinting (Pulse color)
        // We can traverse materials and update color emmissive or diffuse
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                // Apply slight color tint based on risk
                // child.material.color.set(color) // This overrides texture, be careful
                // Instead, maybe use emissive to show "danger"
                if (child.material.emissive) {
                    child.material.emissive.set(color)
                    child.material.emissiveIntensity = 0.2 + (beat * 0.1)
                }
            }
        })
    })

    // Set initial scale/position
    useEffect(() => {
        if (group.current) {
            group.current.scale.set(20.0, 20.0, 20.0)
        }
    }, [])

    return (
        <group ref={group} dispose={null}>
            <primitive object={clonedScene} />
        </group>
    )
}

useGLTF.preload(MODEL_PATH)
