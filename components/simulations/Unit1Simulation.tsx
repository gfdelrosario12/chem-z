"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- INTERFACES AND TYPES ---
type IntermolecularForce = 'Standard' | 'LDF' | 'Dipole-Dipole' | 'Hydrogen-Bonding';
type IntermolecularForceStrength = 'Strong' | 'Weak' | 'None';
type Phase = 'Solid' | 'Liquid' | 'Gas';

// --- Configuration Constants ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 350;
const PARTICLE_COUNT = 50;
const MELTING_POINT = 250; // Temperature at which solid structure breaks
const BOILING_POINT = 400; // Temperature at which liquid fully vaporizes

type SubstanceType = 'Standard' | 'Weak IMF' | 'Strong IMF';

interface Particle {
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  vx: number;
  vy: number;
  radius: number;
}

// Helper to map temperature to base speed (KMT principle)
const getBaseSpeed = (T: number) => (T / 150) * 1.5;

// Define Checkpoint Keys and Descriptions
// --- Checkpoint Definitions ---
// --- Checkpoint Definitions (6 total) ---
const CHECKPOINTS: Record<string, {
  name: string;
  instruction: string;
  criteria: (T: number, P: number, phase: Phase, IMF: IntermolecularForce) => boolean;
}> = {
  'solid_baseline': {
    name: 'CP1: Baseline – Solid Phase (1pt)',
    instruction: "Set IMF = Strong, T = 150K, P = 1 atm. Screenshot + data table required.",
    criteria: (T, P, phase, IMF) =>
      phase === 'Solid' && IMF === 'Hydrogen-Bonding' && T <= 150 && P === 1,
  },
  'solid_to_liquid': {
    name: 'CP2: Solid → Liquid (Melting) (1pt)',
    instruction: "Increase T in 10K steps until ~300K. Screenshot + particle description required.",
    criteria: (T, P, phase, IMF) => phase === 'Liquid' && T >= 250 && T <= 320,
  },
  'liquid_to_gas': {
    name: 'CP3: Liquid → Gas (Boiling/Evaporation) (1pt)',
    instruction: "Heat to 400–450K (P may drop to 0.5 atm). Screenshot + KE value required.",
    criteria: (T, P, phase, IMF) => phase === 'Gas' && T >= 400 && T <= 450,
  },
  'gas_to_liquid': {
    name: 'CP4: Gas → Liquid (Compression) (1pt)',
    instruction: "Keep T ≈ 350K, raise P to 3–4 atm. Screenshot of condensation required.",
    criteria: (T, P, phase, IMF) => phase === 'Liquid' && T < 400 && P >= 3,
  },
  'effect_of_imf': {
    name: 'CP5: Compare IMF Strengths (1pt)',
    instruction: "Repeat CP1–CP4 with IMF = Weak & None. Fill comparative table.",
    criteria: (T, P, phase, IMF) => ['LDF', 'Dipole-Dipole', 'Hydrogen-Bonding'].includes(IMF as 'LDF' | 'Dipole-Dipole' | 'Hydrogen-Bonding'),
  },
  'speed_distribution': {
    name: 'CP6: Speed Distribution (Histogram) (1pt)',
    instruction: "At Gas phase, T=400K, increase to 450K. Note histogram peak shift.",
    criteria: (T, P, phase, IMF) => phase === 'Gas' && T >= 450,
  },
};

// --- Lab Glass Visualizer Component (UPDATED) ---
const LabGlassVisualizer = ({ temperature, currentPhase, substanceType }: { temperature: number, currentPhase: string, substanceType: SubstanceType }) => {
    
    const isHeating = temperature > MELTING_POINT;
    const isShaking = temperature > 350; // Use a threshold for high KE (shaking simulation)

    let phaseClass = '';
    let fillStyle = {};
    let activityClass = '';
    let handActionClass = '';

    // 1. Determine Phase Fill
    if (currentPhase === 'Solid') {
        phaseClass = `vibrate-${Math.min(3, Math.floor((temperature - 150) / 30))}`;
        fillStyle = { backgroundColor: '#3b82f6', height: '40%', bottom: '10px' };
    } else if (currentPhase === 'Liquid') {
        phaseClass = 'slosh';
        fillStyle = { backgroundColor: '#f59e0b', height: '50%', bottom: '10px' };
    } else { // Gas
        phaseClass = 'expand';
        fillStyle = { background: 'linear-gradient(to top, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.7))', height: '90%', bottom: '5px' };
    }

    // 2. Determine Hand/Activity Action
    if (isShaking) {
        handActionClass = 'shake-hand';
        activityClass = 'shake-flask-container'; // Class to shake the flask container
    } else if (isHeating) {
        handActionClass = 'heat-hand';
        activityClass = 'burner-base'; // Class to display the burner
    } else {
        handActionClass = 'hold-hand';
        activityClass = 'stand-base'; // Class for resting/holding
    }

    // Hand position adjustments to look like it's holding the flask
    const handStyle = {
        transform: isHeating ? 'translateY(15px)' : isShaking ? 'translateY(0)' : 'translateY(10px)',
        zIndex: 10,
    };

    return (
        <div className="lab-glass-container relative w-32 h-32 flex justify-center items-center rounded-lg border-2 border-gray-600 bg-gray-900 shadow-inner overflow-hidden">
            
            <div className={`flask-wrapper relative w-16 h-24 flex flex-col justify-end items-center ${activityClass}`}>
                
                {/* Simulated Hand */}
                <div className={`hand absolute top-0 left-1/2 -translate-x-1/2 ${handActionClass}`} style={handStyle}>
                    {/* Simplified Hand (CSS shape) */}
                    <div className="finger thumb"></div>
                    <div className="finger index"></div>
                    <div className="finger middle"></div>
                    <div className="palm"></div>
                </div>

                {/* Flask Body */}
                <div className={`flask w-12 h-20 border-2 border-blue-300/50 rounded-b-xl overflow-hidden relative bg-blue-100/10 ${phaseClass}`}>
                    <div 
                        className="state-fill absolute left-0 right-0 rounded-b-xl transition-all duration-500"
                        style={fillStyle}
                    >
                         {/* Visualizer for Gas condensation/vapor */}
                        <div className={`absolute top-0 left-0 right-0 h-full ${currentPhase === 'Gas' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                            <div className="w-full h-full rounded-b-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Burner Base (Only visible when heating) */}
            {activityClass === 'burner-base' && (
                <div className="burner absolute bottom-0 w-full h-6 flex justify-center items-center">
                    <div className="burner-stand w-14 h-3 bg-gray-600 rounded-t-sm"></div>
                    <div className="flame"></div>
                </div>
            )}
            
            {/* Phase Label */}
            <p className="absolute bottom-1 right-2 text-xs text-gray-400 font-mono">
                {currentPhase.toUpperCase()}
            </p>
            
            {/* Custom CSS for Flask, Hand, and Animations */}
            <style jsx={true}>{`
                /* --- Flask Animations (unchanged) --- */
                @keyframes shake-0 { 0%, 100% { transform: translateY(0); } }
                @keyframes shake-1 { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-0.5px); } 75% { transform: translateY(0.5px); } }
                @keyframes shake-2 { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-1px); } 75% { transform: translateY(1px); } }
                @keyframes shake-3 { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-1.5px); } 75% { transform: translateY(1.5px); } }
                
                @keyframes slosh-anim {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-1deg); }
                    75% { transform: rotate(1deg); }
                }

                .vibrate-0 { animation: shake-0 1s infinite linear; }
                .vibrate-1 { animation: shake-1 0.5s infinite linear; }
                .vibrate-2 { animation: shake-2 0.3s infinite linear; }
                .vibrate-3 { animation: shake-3 0.2s infinite linear; }
                
                .slosh { animation: slosh-anim 2s infinite ease-in-out; }

                /* --- Hand Styles --- */
                .hand {
                    width: 25px;
                    height: 25px;
                    background-color: #e0ac69; /* Skin tone */
                    border-radius: 50% 50% 10% 10%;
                    top: -10px;
                    transform-origin: 50% 100%;
                    transition: transform 0.5s ease-out;
                }
                .palm {
                    width: 100%;
                    height: 100%;
                    border-radius: 50% 50% 10% 10%;
                    background-color: #e0ac69;
                    position: absolute;
                }
                .finger {
                    position: absolute;
                    width: 5px;
                    height: 10px;
                    background-color: #e0ac69;
                    border-radius: 50%;
                    top: -5px;
                }
                .thumb { left: -5px; transform: rotate(-45deg); height: 7px; }
                .index { left: 5px; }
                .middle { left: 12px; }

                /* --- Activity Animation Classes --- */
                
                /* 1. Shaking Activity */
                @keyframes flask-shake {
                    0%, 100% { transform: rotate(0deg) translateX(0); }
                    25% { transform: rotate(-3deg) translateX(-2px); }
                    50% { transform: rotate(0deg) translateX(0); }
                    75% { transform: rotate(3deg) translateX(2px); }
                }
                @keyframes hand-shake-anim {
                    0%, 100% { transform: rotate(0deg) translateY(0); }
                    25% { transform: rotate(-5deg) translateY(0); }
                    75% { transform: rotate(5deg) translateY(0); }
                }

                .shake-flask-container {
                    animation: flask-shake 0.25s infinite ease-in-out;
                }
                .shake-hand {
                    animation: hand-shake-anim 0.25s infinite ease-in-out;
                }

                /* 2. Heating Activity (Burner/Flame) */
                .burner-base {
                    /* Positions the flask correctly over the burner base */
                    transform: translateY(10px); 
                }
                .flame {
                    position: absolute;
                    bottom: 0px;
                    width: 10px;
                    height: 10px;
                    background: orange;
                    border-radius: 50%;
                    box-shadow: 0 0 5px 3px rgba(255, 165, 0, 0.8), 0 0 10px 5px rgba(255, 0, 0, 0.5);
                    animation: flame-flicker 0.3s infinite alternate;
                }
                @keyframes flame-flicker {
                    0% { transform: scale(1, 1) translateY(0); opacity: 1; }
                    100% { transform: scale(0.9, 1.1) translateY(-2px); opacity: 0.9; }
                }
                .heat-hand {
                    /* Hand is higher up, simulating holding the neck */
                    transform: translateY(-5px); 
                }

                /* 3. Holding Still (Solid/Low Temp) */
                .stand-base {
                    /* Simple stand */
                    transform: translateY(0);
                }
                .hold-hand {
                    /* Hand is steady and slightly below the neck */
                    transform: translateY(10px);
                }
            `}</style>
        </div>
    );
};
// --- End Lab Glass Visualizer Component (UPDATED) ---


export default function App() {
  // --- State for UI and Control (unchanged) ---
  const [temperature, setTemperature] = useState(150); // K
  const [pressure, setPressure] = useState(1.0); // atm
  const [substanceType, setSubstanceType] = useState<SubstanceType>('Standard');
  const [points, setPoints] = useState(0);
  const [notification, setNotification] = useState({ message: 'Welcome to the KMT Lab! Use the heater and piston to explore phase changes.', color: 'text-yellow-400' });
  
  // State to track completed checkpoints 
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>({});

  // --- Refs for Animation Loop Access (unchanged) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const tempRef = useRef(temperature);
  const pressureRef = useRef(pressure);
  const substanceRef = useRef(substanceType);

  // Update Refs when state changes
  useEffect(() => { tempRef.current = temperature; }, [temperature]);
  useEffect(() => { pressureRef.current = pressure; }, [pressure]);
  useEffect(() => { substanceRef.current = substanceType; }, [substanceType]);

  // Derived State (for UI clarity)
  const currentPhase = temperature <= MELTING_POINT ? 'Solid' : (temperature <= BOILING_POINT ? 'Liquid' : 'Gas');

  const captureScreenshot = async (): Promise<Blob | null> => {
  const canvas = canvasRef.current;
  if (!canvas) {
    showNotification("Canvas not found!", "red");
    return null;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
};

const uploadScreenshotToS3 = async () => {
  try {
    const blob = await captureScreenshot();
    if (!blob) {
      showNotification("Failed to capture screenshot", "red");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 1️⃣ Ask backend for a presigned URL in the "proofs" folder
    const presignRes = await fetch(`${baseUrl}/activities/presigned-url/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: `screenshot_${Date.now()}.png`,
        contentType: "image/png",
      }),
    });

    if (!presignRes.ok) throw new Error("Failed to get presigned URL");

    const { url, fileName, s3Key } = await presignRes.json();

    // 2️⃣ Upload file to S3
    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: blob,
    });

    if (!uploadRes.ok) throw new Error("S3 upload failed");

    // 3️⃣ Construct final public URL
    const fileUrl = url.split("?")[0];

    showNotification("✅ Screenshot uploaded!", "green", 5000);

    return { fileUrl, fileName, s3Key };
  } catch (err) {
    console.error("Upload error", err);
    showNotification("Upload failed!", "red", 5000);
    return null;
  }
};

  // Determine particle radius based on substance type
  const getParticleRadius = (substance: SubstanceType): number => {
    if (substance === 'Weak IMF') return 10;
    if (substance === 'Strong IMF') return 6;
    return 8; // Standard
  };

  // --- Notification Helper (unchanged) ---
  const showNotification = useCallback((message: string, color: string, duration = 3000) => {
    setNotification({ message, color: `text-${color}-400` });
    setTimeout(() => {
      setNotification({ message: 'Ready to continue the experiment.', color: 'text-yellow-400' });
    }, duration);
  }, []);

  // --- Particle Initialization Logic (unchanged) ---
  const initializeParticles = useCallback((substance: SubstanceType) => {
    const rows = 5;
    const cols = PARTICLE_COUNT / rows;
    const spacingX = CANVAS_WIDTH / (cols + 1);
    const spacingY = CANVAS_HEIGHT / (rows + 1);
    const radius = getParticleRadius(substance);

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const initialX = spacingX * (col + 1);
      const initialY = spacingY * (row + 1);

      return {
        x: initialX,
        y: initialY,
        initialX,
        initialY,
        vx: 0,
        vy: 0,
        radius
      };
    });
  }, []);

  // --- Simulation Loop (unchanged logic) ---
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTemp = tempRef.current;
    const currentPressure = pressureRef.current;
    const currentSubstance = substanceRef.current;
    let particles = particlesRef.current;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Container/Piston
    const maxCompression = 0.6;
    const compressionFactor = 1 - (currentPressure / 5) * maxCompression;
    const effectiveHeight = CANVAS_HEIGHT * compressionFactor;

    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - effectiveHeight);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - effectiveHeight);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - effectiveHeight);
    ctx.stroke();

    const speedMultiplier = getBaseSpeed(currentTemp);
    const particleColor = currentSubstance === 'Weak IMF' ? '#fcd34d' : (currentSubstance === 'Strong IMF' ? '#10b981' : '#93c5fd');

    particles = particles.map((p, i) => {
      let { x, y, vx, vy, radius, initialX, initialY } = p;
      const currentSimPhase = currentTemp <= MELTING_POINT ? 'solid' : 'fluid';

      if (currentSimPhase === 'solid') {
        const vibrationAmplitude = (currentTemp - 150) / 70;
        x = initialX + Math.sin(timestamp / (40 - vibrationAmplitude) + i) * vibrationAmplitude;
        y = initialY + Math.cos(timestamp / (40 - vibrationAmplitude) + i) * vibrationAmplitude;
        vx = 0; vy = 0;
      } else {
        const currentSpeed = speedMultiplier * 0.5 + (currentTemp > BOILING_POINT ? speedMultiplier * 0.5 : 0);
        vx += (Math.random() - 0.5) * 0.1;
        vy += (Math.random() - 0.5) * 0.1;

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
          vx = (vx / mag) * currentSpeed;
          vy = (vy / mag) * currentSpeed;
        }

        x += vx;
        y += vy;

        if (x - radius < 0 || x + radius > CANVAS_WIDTH) {
          vx *= -1;
          x = x - radius < 0 ? radius : CANVAS_WIDTH - radius;
        }
        if (y - radius < 0 || y + radius > effectiveHeight) {
          vy *= -1;
          y = y - radius < 0 ? radius : effectiveHeight - radius;
        }
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      const fillStyle = currentTemp > BOILING_POINT ? '#ef4444' : (currentTemp > MELTING_POINT ? '#f97316' : particleColor);
      ctx.fillStyle = fillStyle;
      ctx.shadowColor = fillStyle;
      ctx.shadowBlur = currentTemp / 50;
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;

      return { ...p, x, y, vx, vy };
    });

    // Particle interactions
    const attractionFactor = currentSubstance === 'Strong IMF' ? 0.2 : (currentSubstance === 'Weak IMF' ? 0.9 : 0.5);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = p1.radius + p2.radius;
        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const overlap = minDistance - distance;
          p1.x += overlap * Math.cos(angle) * 0.5;
          p1.y += overlap * Math.sin(angle) * 0.5;
          p2.x -= overlap * Math.cos(angle) * 0.5;
          p2.y -= overlap * Math.sin(angle) * 0.5;

          const tempVX1 = p1.vx;
          const tempVY1 = p1.vy;
          p1.vx = p2.vx * attractionFactor;
          p1.vy = p2.vy * attractionFactor;
          p2.vx = tempVX1 * attractionFactor;
          p2.vy = tempVY1 * attractionFactor;
        }
      }
    }

    particlesRef.current = particles;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []); 

  // --- Checkpoint Submission Logic (unchanged) ---
  const submitCheckpoint = () => {
    let taskKey = '';
    let pointsAwarded = 1;

    for (const key in CHECKPOINTS) {
      if (key in CHECKPOINTS && CHECKPOINTS[key].criteria(temperature, pressure, currentPhase, substanceType as IntermolecularForce)) {
        taskKey = key;
        break; 
      }
    }
    
    if (taskKey === '' && (completedCheckpoints['solid_baseline'] && completedCheckpoints['solid_to_liquid'] && completedCheckpoints['liquid_to_gas'] && completedCheckpoints['gas_to_liquid'])) {
        showNotification('All Phase Change Checkpoints Complete! Submit your external data (CP5, CP6) using the Final Submit button.', 'yellow', 6000);
        return;
    }


    if (taskKey) {
      const name = CHECKPOINTS[taskKey].name;
      if (!completedCheckpoints[taskKey]) {
        setPoints(p => p + pointsAwarded);
        setCompletedCheckpoints(prev => ({ ...prev, [taskKey]: true }));
        showNotification(`${name} successfully submitted! (+${pointsAwarded} Pt)`, 'lime', 5000); 
      } else {
        showNotification(`${name} already completed. No points awarded.`, 'orange');
      }
    } else {
      showNotification('Current state does not match a defined checkpoint task. Check the Guidance Panel for criteria.', 'red', 5000);
    }
  };

  // --- Final Submission Logic (unchanged) ---
  const finalSubmission = () => {
    const completedSimulationCheckpoints = Object.keys(completedCheckpoints).filter(key => key.startsWith('solid') || key.startsWith('liquid') || key.startsWith('gas')).length;
    
    if (completedSimulationCheckpoints === 4) {
      showNotification(`FINAL SUBMISSION: All 4 phase change checkpoints successfully logged. Total Score: ${points} points (from simulation). Submit your worksheet for full points!`, 'green', 10000);
    } else {
      showNotification(`FINAL SUBMISSION: Only ${completedSimulationCheckpoints} of 4 simulation checkpoints logged. Complete all required steps and submit your full worksheet.`, 'yellow', 10000);
    }
  };

  // --- Hint Logic (unchanged) ---
  const getHint = () => {
    const checkpointKeys = ['solid_baseline', 'solid_to_liquid', 'liquid_to_gas', 'gas_to_liquid'];
    let nextCheckpointKey = null;

    // Find the next uncompleted simulation checkpoint
    for (const key of checkpointKeys) {
      if (!completedCheckpoints[key]) {
        nextCheckpointKey = key;
        break;
      }
    }

    if (!nextCheckpointKey) {
      showNotification("All primary simulation checkpoints (CP1-CP4) are complete! Focus on CP5/CP6 and the Final Submission.", 'green', 6000);
      return;
    }
    
    const currentT = temperature;
    const currentP = pressure;
    const currentIMF = substanceType;
    const nextCPName = CHECKPOINTS[nextCheckpointKey].name;

    let hintMessage = `Hint for ${nextCPName}: `;
    let hintColor = 'cyan';

    switch (nextCheckpointKey) {
        case 'solid_baseline':
            // Fixed formatting from **Strong IMF** to <b>Strong IMF</b> for notification
            hintMessage += `You must start with a <b>Strong IMF</b> substance. Ensure your <b>Temperature</b> is near the minimum (${150}K) and <b>Pressure</b> is low (${1.0} atm).`;
            if (currentIMF !== 'Strong IMF') hintMessage = "Hint: Switch the <b>Substance Type</b> to <b>Strong IMF</b> first.";
            break;
        case 'solid_to_liquid':
            hintMessage += `The substance is currently solid. You need to <b>add energy</b> to break the lattice structure. Try increasing the <b>Temperature</b> above ${MELTING_POINT}K.`;
            if (currentT < MELTING_POINT) hintMessage += ` (Current T: ${currentT}K. Target > ${MELTING_POINT}K)`;
            break;
        case 'liquid_to_gas':
            hintMessage += `The substance is liquid. To turn it into a gas (Vapor State), you must increase the <b>Temperature</b> further to overcome all intermolecular forces. Try heating above ${BOILING_POINT}K.`;
            if (currentT < BOILING_POINT) hintMessage += ` (Current T: ${currentT}K. Target ≥ ${BOILING_POINT}K)`;
            break;
        case 'gas_to_liquid':
            hintMessage += `The substance is gas. To condense it back to a liquid, you need to either <b>cool it down</b> or <b>increase the pressure</b> (compression). Try raising the <b>Pressure</b> to ${3.0} atm or higher while keeping T below ${BOILING_POINT}K.`;
            if (currentP < 3.0) hintMessage += ` (Current P: ${currentP.toFixed(1)} atm. Target ≥ ${3.0} atm)`;
            break;
    }

    // Using dangerouslySetInnerHTML to allow HTML for bolding in the notification message
    setNotification({ message: hintMessage, color: `text-${hintColor}-400` });
    setTimeout(() => {
        setNotification({ message: 'Ready to continue the experiment.', color: 'text-yellow-400' });
    }, 7000);
  };

  // --- Simulation Control Effects (unchanged) ---
  useEffect(() => {
    initializeParticles(substanceType);
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeParticles, gameLoop, substanceType]);

  // Effect to re-initialize if substance changes (unchanged)
  useEffect(() => {
    initializeParticles(substanceType);
    showNotification(`Switched substance to ${substanceType}. Resetting to initial solid state.`, 'blue');
    setTemperature(150);
    setPressure(1.0);
  }, [substanceType, initializeParticles, showNotification]);

  // MODIFIED resetTrial (unchanged)
  const resetTrial = () => {
    setTemperature(150);
    setPressure(1.0);
    initializeParticles(substanceType);
    setPoints(0); // Reset points
    setCompletedCheckpoints({}); // Reset tracker
    showNotification('Trial fully reset. Points and checkpoints cleared. Particles returned to solid lattice (150K, 1.0 atm).', 'red', 5000);
  };

  // --- Controls (unchanged) ---
  const renderControls = () => (
    <div className="flex justify-center gap-6 flex-wrap p-3 bg-gray-700 rounded-lg">
      <div className="text-center p-2 bg-gray-600 rounded-lg w-40">
        <label className="block text-sm mb-2 font-medium text-yellow-300">
          Heater (Temperature: $T$)
        </label>
        <input
          type="range"
          min="150"
          max="500"
          value={temperature}
          onChange={(e) => setTemperature(parseInt(e.target.value))}
          className="control-input"
        />
        <div className="text-lg font-bold mt-1 text-white">{temperature} K</div>
      </div>

      <div className="text-center p-2 bg-gray-600 rounded-lg w-40">
        <label className="block text-sm mb-2 font-medium text-yellow-300">
          Piston (Pressure: $P$)
        </label>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={pressure}
          onChange={(e) => setPressure(parseFloat(e.target.value))}
          className="control-input"
        />
        <div className="text-lg font-bold mt-1 text-white">{pressure.toFixed(1)} atm</div>
      </div>
    </div>
  );

  const getTaskInstruction = () => {
    if (currentPhase === 'Solid' && temperature < MELTING_POINT) {
      return `The particles are vibrating in a lattice. Current IMF: ${substanceType}. Increase T to start the melting process (CP2).`;
    }
    if (currentPhase === 'Liquid') {
      return `The particles move freely but remain close. Continue heating to reach the Boiling Point (Gas) or use the Piston to observe volume changes.`;
    }
    if (currentPhase === 'Gas') {
      return `The particles are moving rapidly and filling the container. Use the Piston to increase pressure and force the gas to condense back into a Liquid (CP4).`;
    }
    return "Experiment by manipulating the controls to observe how temperature and pressure affect the state of matter.";
  };

  const heaterStyle = {
    background: `linear-gradient(to right, #4b5563, ${temperature > 150 ? (temperature > 400 ? '#ef4444' : '#f97316') : '#4b5563'})`,
    height: '10px',
    borderRadius: '0 0 12px 12px'
  };

  return (
    <div className="lab-container mx-auto p-4 bg-gray-800 text-white rounded-xl shadow-2xl">
      <style jsx={true}>{`
        body { font-family: 'Inter', sans-serif; background-color: #1f2937; }
        .lab-container { max-width: 1200px; }
        .simulation-canvas {
            background-color: #0d1117;
            border-left: 4px solid #3b82f6;
            border-right: 4px solid #3b82f6;
            border-top: 4px solid #3b82f6;
            cursor: default;
        }
        .control-input {
            -webkit-appearance: none;
            width: 100%;
            height: 8px;
            background: #4b5563;
            border-radius: 4px;
            outline: none;
            opacity: 0.8;
            transition: opacity .15s;
        }
        .control-input:hover { opacity: 1; }
        .control-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fcd34d;
            cursor: pointer;
            box-shadow: 0 0 5px rgba(252, 211, 77, 0.8);
        }
      `}</style>

      <h1 className="text-3xl font-extrabold mb-4 text-center text-blue-400">
        KMT Lab: Phase Change Manipulator
      </h1>

      {/* IMF Selection & Lab Glass Visualizer */}
      <div className="flex justify-center items-center gap-6 mb-6 p-4 bg-gray-900 rounded-lg">
        
        {/* IMF Selection */}
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium self-center text-gray-300">Substance Type:</span>
            {['Standard', 'Weak IMF', 'Strong IMF'].map(type => (
            <button
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition transform hover:scale-105 ${substanceType === type ? "bg-purple-600 text-white shadow-lg" : "bg-gray-600 text-gray-200 hover:bg-gray-500"}`}
                onClick={() => setSubstanceType(type as SubstanceType)}
            >
                {type}
            </button>
            ))}
        </div>
        
        {/* Vertical Separator */}
        <div className="w-px h-12 bg-gray-600"></div>

        {/* Lab Glass Visualizer (UPDATED HERE) */}
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Physical State Visualizer:</span>
            <LabGlassVisualizer temperature={temperature} currentPhase={currentPhase} substanceType={substanceType} />
        </div>
      </div>

      {/* Main Layout: Simulation Column (Left) and Guidance Panel (Right) */}
      <div className="flex gap-6">
        
        {/* Left/Main Column (Controls, Status, Canvas) */}
        <div className="flex-grow max-w-[600px] mx-auto">
          
          {/* Controls and Final Submission */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-grow">
              {renderControls()}
            </div>
            
            {/* FINAL SUBMISSION BUTTON */}
            <button
              className="w-32 h-20 bg-teal-500 text-gray-900 font-extrabold text-sm rounded-lg hover:bg-teal-400 transition transform hover:scale-105 active:scale-95 shadow-xl flex flex-col justify-center items-center"
              onClick={finalSubmission}
            >
              <span className="text-2xl">📤</span>
              FINAL SUBMIT
            </button>
          </div>

          {/* STATUS DISPLAY (Points, Phase, Notification) */}
          <div className="flex justify-between items-center mb-4 px-4 py-3 bg-gray-900 rounded-lg border-b-2 border-blue-600">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 text-lg font-bold">
                <span className="text-white">Phase:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentPhase === 'Solid' ? 'bg-blue-600' : currentPhase === 'Liquid' ? 'bg-yellow-600' : 'bg-red-600'}`}>{currentPhase}</span>
              </div>
              <div className="text-xl font-bold mt-2">Total Points: <span id="points-display" className="text-green-400">{points}</span></div>
            </div>
            {/* CHECKPOINT TRACKER (Condensed version) */}
            <div className="flex flex-col items-end">
              <h4 className="text-sm font-bold text-blue-300 mb-1">Sim CPs (4 pts):</h4>
              <div className="flex gap-1">
                {Object.keys(CHECKPOINTS).slice(0, 4).map(key => (
                  <div 
                    key={key} 
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold ${completedCheckpoints[key] ? "bg-green-600 text-white shadow-md" : "bg-red-800 text-red-200"}`}
                    title={CHECKPOINTS[key].name}
                  >
                    {key.split('_')[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Notification Area - using dangerouslySetInnerHTML for HTML bolding in hints */}
          <div className="text-center mb-4 px-4 py-2 bg-gray-700/50 rounded-lg">
            <div className={`font-medium text-lg ${notification.color}`} dangerouslySetInnerHTML={{ __html: notification.message }} />
          </div>

          <div className="p-4 border border-blue-600 rounded-lg bg-gray-700/50 text-sm mb-4">
            <h3 className="font-bold mb-2 text-blue-300">Lab Task: <span className="font-normal">Current Goal:</span></h3>
            <p id="current-instruction">{getTaskInstruction()}</p>
          </div>

          {/* SIMULATION CANVAS */}
          <div className="mx-auto block" style={{ width: `${CANVAS_WIDTH}px` }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="simulation-canvas w-full"
            />
            <div style={{ ...heaterStyle, width: `${CANVAS_WIDTH}px` }} className="mx-auto shadow-2xl"></div>
            <div className="p-1 bg-blue-900 rounded-b-xl border-x-4 border-b-4 border-blue-600">
              <span className="text-xs font-mono">REACTOR BASE</span>
            </div>
          </div>

          {/* Action Buttons (with Hint button) */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-400 transition transform hover:scale-105 active:scale-95 shadow-lg"
              onClick={uploadScreenshotToS3}
            >
              <span className="inline-block align-text-bottom mr-1">📸</span> Upload Checkpoint Screenshot
            </button>
            <button
              className="px-6 py-3 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-400 transition transform hover:scale-105 active:scale-95 shadow-lg"
              onClick={getHint}
            >
              <span className="inline-block align-text-bottom mr-1">💡</span> Show Hint
            </button>
            <button
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-400 transition transform hover:scale-105 active:scale-95 shadow-lg"
              onClick={resetTrial}
            >
              <span className="inline-block align-text-bottom mr-1">⟲</span> Reset Trial (Clears Points & Tracker)
            </button>
          </div>

        </div>

        {/* Right Column (Checkpoint Guidance Panel) */}
        <div className="w-96 p-4 bg-gray-700 rounded-xl shadow-lg border border-blue-500 h-fit sticky top-4">
          <h2 className="text-xl font-extrabold text-yellow-300 mb-4 text-center border-b pb-2 border-yellow-500/50">
            Experiment Checkpoints Guidance (6 Total)
          </h2>
          
          <div className="space-y-4">
            {Object.entries(CHECKPOINTS).map(([key, cp], index) => (
              <div key={key} className={`p-3 rounded-lg transition ${completedCheckpoints[key] ? 'bg-green-800/70 border-l-4 border-green-400' : 'bg-gray-800/70 border-l-4 border-red-400'}`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold ${completedCheckpoints[key] ? 'text-green-300' : 'text-white'}`}>
                    {cp.name}
                  </h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${completedCheckpoints[key] ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                    {completedCheckpoints[key] ? 'DONE' : 'PENDING'}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {cp.instruction}
                </p>
                {/* Show current state for the simulation-validated checkpoints (CP1-CP4) */}
                {index < 4 && (
                    <p className="text-xs text-blue-400 mt-2 p-1 bg-gray-700 rounded">
                        Status: {cp.criteria(temperature, pressure, currentPhase, substanceType as IntermolecularForce) ? 
                            'Criteria Met (Ready to Submit)' : 
                            'Criteria Not Met. Adjust controls.'}
                    </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center mt-4 text-gray-400 text-xs">
        Particle state is driven by the **Heater** (Temperature) and confined by the **Piston** (Pressure).
      </p>
    </div>
  );
}