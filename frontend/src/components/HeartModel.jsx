import React, { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Preload the model
// Adjust path to match the directory found
// Preload the model
// Adjust path to match the directory found
const MODEL_PATH = '/models/new_heart/scene.gltf'

export function HeartModel({ visuals }) {
    const group = useRef()
    const { nodes, materials, scene } = useGLTF(MODEL_PATH)

    // Clone the scene to avoid mutation issues if used multiple times
    const clonedScene = React.useMemo(() => scene.clone(), [scene])

    // Refs for animation
    const timeRef = useRef(0)

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

    // Base scale for the new model. 
    // Previous model needed 20.0, new one might range 0.01 to 100.
    // Start with 2.5
    const BASE_SCALE = 2.5

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
        // Map beat (-1 to 1) to Scale

        // Simple pulsating effect:
        // Scale varies between 1.0 and (1.0 - intensity * 0.1)
        const scaleFactor = 1.0 + (beat * 0.05 * contraction_intensity)

        group.current.scale.set(
            BASE_SCALE * scaleFactor,
            BASE_SCALE * scaleFactor,
            BASE_SCALE * scaleFactor
        )

        // Color tinting (Pulse color)
        // We can traverse materials and update color emmissive or diffuse
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                // Apply slight color tint based on risk
                if (child.material) {
                    // Check if material supports emissive
                    if (child.material.emissive) {
                        child.material.emissive.set(color)
                        // Gentle pulse
                        child.material.emissiveIntensity = 0.1 + (beat * 0.05)
                    }
                }
            }
        })
    })

    // Set initial scale/position
    useEffect(() => {
        if (group.current) {
            group.current.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE)
        }
    }, [])

    return (
        <group ref={group} dispose={null}>
            <primitive object={clonedScene} />
        </group>
    )
}

useGLTF.preload(MODEL_PATH)
