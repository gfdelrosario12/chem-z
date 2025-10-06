"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface SolutionsLabProps {
  activityID: string; // ✅ NEW PROP
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 350;
const NACL_MOLAR_MASS_G_MOL = 58.44;
const SOLUBILITY_25C = 36.0;
const SOLUBILITY_60C = 37.0;

const getSolubilityLimit = (T: number) => {
  if (T <= 25) return SOLUBILITY_25C;
  if (T >= 60) return SOLUBILITY_60C;
  const slope = (SOLUBILITY_60C - SOLUBILITY_25C) / (60 - 25);
  return SOLUBILITY_25C + slope * (T - 25);
};

type PhaseType = "Unsaturated" | "Saturated" | "Supersaturated";

interface Notification {
  message: string;
  color: string;
}

const CHECKPOINTS: {
  [key: string]: {
    name: string;
    instruction: string;
    hint: string;
    requiredState: (
      n: number,
      M: number,
      m: number,
      T: number,
      Phase: PhaseType,
      isSeeded?: boolean
    ) => boolean;
  };
} = {
  unsaturated_prepare: {
    name: "CP1: Prepare Unsaturated (1 pt)",
    instruction: "Set T=25°C, V=100mL. Add NaCl=2.0g. Task: Record n, M.",
    hint: "Check your temperature and amount of solute. Are you in the unsaturated range?",
    requiredState: (n, M, m, T, Phase) =>
      T === 25 && n > 0.033 && n < 0.036 && Phase === "Unsaturated",
  },

  approach_saturation: {
    name: "CP2: Approach Saturation (1 pt)",
    instruction: "Add solute until solid remains. Task: Record total dissolved mass, n, M.",
    hint: "Solution may not be saturated yet. Try adding more solute or check T.",
    requiredState: (n, M, m, T, Phase) =>
      T === 25 && n > 0.61 && n < 0.62 && Phase === "Saturated",
  },

  supersaturation_ready: {
    name: "CP3a: Supersaturation Prep (1 pt)",
    instruction: "Heat to 60°C, dissolve all. Cool to 25°C without disturbance.",
    hint: "Ensure all solute is dissolved before cooling. Avoid shaking or stirring.",
    requiredState: (n, M, m, T, Phase) =>
      T === 25 && n > 0.61 && Phase === "Supersaturated",
  },

  supersaturation_seeded: {
    name: "CP3b: Seed Crystal Added (1 pt)",
    instruction: "Add a seed crystal in the supersaturated solution.",
    hint: "Crystallization starts only if the seed crystal is added.",
    requiredState: (n, M, m, T, Phase, isSeeded) => !!isSeeded,
  },

  temp_effect_25: {
    name: "CP4: Temperature Effect at 25°C (1 pt)",
    instruction: "Repeat the saturation at 25°C.",
    hint: "Ensure the solution reaches saturation at 25°C.",
    requiredState: (n, M, m, T, Phase) =>
      T === 25 && Phase === "Saturated" && n > 0.61 && n < 0.62,
  },

  temp_effect_40: {
    name: "CP5: Temperature Effect at 40°C (1 pt)",
    instruction: "Repeat the saturation at 40°C.",
    hint: "Ensure the solution reaches saturation at 40°C.",
    requiredState: (n, M, m, T, Phase) =>
      T === 40 && Phase === "Saturated" && n > 0.61 && n < 0.64,
  },

  temp_effect_60: {
    name: "CP6: Temperature Effect at 60°C (1 pt)",
    instruction: "Repeat the saturation at 60°C.",
    hint: "Ensure the solution reaches saturation at 60°C.",
    requiredState: (n, M, m, T, Phase) =>
      T === 60 && Phase === "Saturated" && n > 0.62 && n < 0.65,
  },

  molality_extension: {
    name: "CP7: Molality vs. Molarity (Bonus 1 pt)",
    instruction: "Set V=250mL, Add 7.5g NaCl, T=25°C. Task: Record M and m.",
    hint: "Check your recorded molality and molarity values. Are they correct?",
    requiredState: (n, M, m, T, Phase) =>
      T === 25 &&
      n > 0.127 && n < 0.130 &&
      M > 0.51 && M < 0.52 &&
      m > 0.51 && m < 0.52,
  },


};

const SolutionsLab: React.FC<SolutionsLabProps> = ({ activityID }) => {
  // ✅ Log when activityID is received
  useEffect(() => {
    console.log("SolutionsLab loaded for activityID:", activityID);
  }, [activityID]);
  const studentId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  // --- existing states and logic ---
  const [soluteMass, setSoluteMass] = useState(2.0);
  const [solventVolume, setSolventVolume] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isCooled, setIsCooled] = useState(false);
  const [wasHeated, setWasHeated] = useState(false);
  const [points, setPoints] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [completedCheckpoints, setCompletedCheckpoints] = useState<
    Record<string, boolean>
  >({});
  const [notification, setNotification] = useState<Notification>({
    message:
      "Welcome to the Solutions Lab! Start by preparing an unsaturated solution (CP1).",
    color: "text-yellow-400",
  });

  // Add a derived state to check if final submission is allowed
  const isFinalSubmitBlocked = Object.keys(CHECKPOINTS).some(
    (key) => !completedCheckpoints[key]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const n_mol = soluteMass / NACL_MOLAR_MASS_G_MOL;
  const solventMass_kg = solventVolume / 1000;
  const solubilityLimit_g = getSolubilityLimit(temperature) * (solventVolume / 100);

  let dissolvedMass = Math.min(soluteMass, solubilityLimit_g);
  let currentPhase: PhaseType = 'Unsaturated';
  let undissolvedMass = 0;

  // Check for supersaturation first (special cooled state)
  if (isCooled && temperature === 25) {
    const solubilityAt25C = getSolubilityLimit(25) * (solventVolume / 100);
    if (soluteMass > solubilityAt25C) {
      dissolvedMass = soluteMass; // Everything stays dissolved in supersaturated state
      currentPhase = 'Supersaturated';
      undissolvedMass = 0;
    }
  } else {
    // Normal saturation logic
    undissolvedMass = Math.max(0, soluteMass - solubilityLimit_g);
    if (undissolvedMass > 0.001) {
      currentPhase = 'Saturated';
      dissolvedMass = solubilityLimit_g;
    }
  }

  const dissolved_n_mol = dissolvedMass / NACL_MOLAR_MASS_G_MOL;
  const molarity = dissolved_n_mol / (solventVolume / 1000);
  const molality = dissolved_n_mol / solventMass_kg;

  const showNotification = useCallback((message: string, color: string, duration = 3000) => {
    setNotification({ message, color: `text-${color}-400` });
    setTimeout(() => setNotification({ message: 'Ready for the next step.', color: 'text-yellow-400' }), duration);
  }, []);

  const getNextClue = () => {
    if (!completedCheckpoints['unsaturated_prepare']) {
      if (temperature !== 25) return "Set temperature to exactly 25°C";
      if (solventVolume !== 100) return "Set volume to exactly 100mL";
      if (Math.abs(soluteMass - 2.0) > 0.05) return "Set solute mass to 2.0g";
      if (currentPhase !== 'Unsaturated') return "Should be Unsaturated - try less solute";
      return "Values look good! Click Submit Checkpoint";
    }

    if (!completedCheckpoints['approach_saturation']) {
      if (temperature !== 25) return "Keep temperature at 25°C";
      if (currentPhase !== 'Saturated') return "Add more solute until you see solid at bottom (Saturated)";
      return "You have a saturated solution! Click Submit Checkpoint";
    }

    if (!completedCheckpoints['supersaturation_ready']) {
      if (temperature < 50 && !wasHeated) return "First, heat to 60°C to dissolve more solute";
      if (temperature >= 50 && soluteMass < 37) return "Add solute to ~37g while hot";
      if (temperature > 25 && soluteMass > 36) return "Now cool back to 25°C carefully";
      if (currentPhase !== 'Supersaturated') return "Should be Supersaturated - heat to 60°C, add ~37g, cool to 25°C";
      return "Supersaturated! Click Submit Checkpoint";
    }

    if (!completedCheckpoints['supersaturation_seeded']) {
      if (currentPhase !== 'Supersaturated') return "Need Supersaturated solution first (complete CP3a)";
      return "Click 'Add Seed Crystal' button, then Submit Checkpoint";
    }

    if (!completedCheckpoints['molality_extension']) {
      if (Math.abs(solventVolume - 250) > 1) return "Set volume to 250mL";
      if (Math.abs(soluteMass - 7.3) > 0.1) return "Set solute mass to 7.3g";
      return "Values correct! Click Submit Checkpoint";
    }

    return "All checkpoints complete! Try exploring different conditions.";
  };

  useEffect(() => {
    if (temperature >= 50) setWasHeated(true);
  }, [temperature]);

  useEffect(() => {
    const solubilityAt25C = getSolubilityLimit(25) * (solventVolume / 100);
    const massExceeds25CSolubility = soluteMass > solubilityAt25C + 0.5;

    // When cooled to 25°C with excess solute that was dissolved at higher temp
    if (temperature === 25 && massExceeds25CSolubility && wasHeated && !isCooled) {
      setIsCooled(true);
      showNotification('Supersaturation achieved! Solution is UNSTABLE. Add seed crystal for CP3b!', 'red', 6000);
    }

    // Reset supersaturation if heated again
    if (temperature > 30 && isCooled) {
      setIsCooled(false);
    }
  }, [temperature, soluteMass, solventVolume, wasHeated, isCooled, showNotification]);

  useEffect(() => {
    if (isSeeded && currentPhase === 'Supersaturated') {
      setSoluteMass(solubilityLimit_g);
      setIsCooled(false);
      setWasHeated(false);
      showNotification('Crystallization triggered! The solution has returned to a Saturated state.', 'red', 5000);
    }
  }, [isSeeded, currentPhase, solubilityLimit_g, showNotification]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = `rgba(30, 58, 138, ${0.4 + (temperature - 25) / 100})`;
    ctx.fillRect(0, 0, width, height);

    const ionCount = Math.floor(dissolved_n_mol * 1000);
    for (let i = 0; i < Math.min(ionCount, 150); i++) {
      const type = i % 2 === 0 ? 'Na+' : 'Cl-';
      const color = type === 'Na+' ? '#FBBF24' : '#E5E7EB';
      const speedFactor = 1 + (temperature - 25) / 50;
      const x = (i * 10 + frameCount * speedFactor) % width;
      const y = (i * 7 + frameCount * speedFactor) % height;
      const wobbleX = Math.sin(frameCount * 0.05 + i) * 10;
      const wobbleY = Math.cos(frameCount * 0.03 + i) * 10;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc((x + wobbleX) % width, (y + wobbleY) % height, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (undissolvedMass > 0.001 && currentPhase === 'Saturated') {
      const solidHeight = Math.min(20, undissolvedMass / 3);
      ctx.fillStyle = '#6B7280';
      ctx.fillRect(0, height - solidHeight, width, solidHeight);
      for (let i = 0; i < Math.min(100, undissolvedMass * 5); i++) {
        const x = Math.random() * width;
        const y = height - solidHeight - Math.random() * 5;
        ctx.fillStyle = i % 2 === 0 ? '#4B5563' : '#9CA3AF';
        ctx.fillRect(x, y, 4, 4);
      }
    }

    if (isSeeded) {
      for (let i = 0; i < 100; i++) {
        const x = width / 2 + Math.cos(i + frameCount * 0.1) * (frameCount * 0.5);
        const y = height / 2 + Math.sin(i + frameCount * 0.1) * (frameCount * 0.5);
        ctx.beginPath();
        ctx.fillStyle = '#E5E7EB';
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.textAlign = 'center';
    let statusText = currentPhase.toUpperCase();
    if (currentPhase === 'Supersaturated' && temperature === 25) {
      statusText = 'SUPERSATURATED (Unstable!)';
      ctx.fillStyle = '#DC2626';
    }
    ctx.fillText(statusText, width / 2, 30);

    animationFrameRef.current = requestAnimationFrame(() => draw(ctx, frameCount + 1));
  }, [dissolved_n_mol, undissolvedMass, temperature, currentPhase, isSeeded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, 0);
    }
    return () => {
      animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draw]);

  const handleMassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMass = parseFloat(e.target.value);
    if (isNaN(newMass)) newMass = 0;
    newMass = Math.max(0, Math.min(70, newMass));
    setSoluteMass(newMass);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newT = parseInt(e.target.value);
    if (isNaN(newT)) newT = 25;
    newT = Math.max(25, Math.min(80, newT));
    setTemperature(newT);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newV = parseInt(e.target.value);
    if (isNaN(newV)) newV = 100;
    newV = Math.max(50, Math.min(300, newV));
    setSolventVolume(newV);
  };

  const submitCheckpoint = () => {
    let checkpointAwarded = false;

    for (const key in CHECKPOINTS) {
      if (completedCheckpoints[key]) continue; // Skip already completed

      const cp = CHECKPOINTS[key];
      const meetsCriteria = cp.requiredState(
        dissolved_n_mol,
        molarity,
        molality,
        temperature,
        currentPhase,
        isSeeded
      );

      if (meetsCriteria) {
        // ✅ Correct checkpoint, award point
        setPoints(prev => prev + 1);
        setCompletedCheckpoints(prev => ({ ...prev, [key]: true }));
        setFeedbacks(prev => ({ ...prev, [key]: "Checkpoint completed successfully!" }));
        showNotification(`✅ ${cp.name} completed! You earned 1 point.`, 'green', 4000);

        checkpointAwarded = true;
        break; // Only submit one checkpoint at a time
      } else {
        // ❌ Incorrect — show hint
        showNotification(`💡 Hint: ${cp.hint}`, 'yellow', 5000);
        checkpointAwarded = false;
        break; // Show hint for the first unmet checkpoint
      }
    }

    if (!checkpointAwarded && Object.keys(completedCheckpoints).length === Object.keys(CHECKPOINTS).length) {
      showNotification("All checkpoints completed!", 'blue', 4000);
    }
  };

  const finalSubmit = async () => {
    try {
      if (!studentId) {
        showNotification("❌ Student ID missing!", "red", 4000);
        return;
      }

      // --- Send 3 PATCH requests to increment retries ---
      for (let i = 0; i < 3; i++) {
        await fetch(`${baseUrl}/activities/${activityID}/retries/${studentId}`, {
          method: "PATCH",
        });
      }

      // --- Check retries from backend ---
      const retriesRes = await fetch(`${baseUrl}/activities/${activityID}/retries/${studentId}`);
      const retries = await retriesRes.json();

      if (retries !== 3) {
        showNotification("💡 Full lab can only be submitted if retries = 3.", "yellow", 5000);
        return;
      }

      // --- Send full score if retries = 3 ---
      const fullScore = 100;
      await fetch(`${baseUrl}/activities/${activityID}/score/${studentId}?score=${fullScore}`, {
        method: "PATCH",
      });

      showNotification("✅ Final submission successful! You earned 100 points.", "green", 5000);
    } catch (err) {
      console.error("Final submission failed:", err);
      showNotification("❌ Submission failed. Try again later.", "red", 5000);
    }
  };

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Add a seed crystal to the solution. This will only work if the current phase is 'Supersaturated'.
   * If the current phase is not 'Supersaturated', a notification will be shown.
   */
  /*******  c69b180c-729f-42ad-bfd4-7d9750a9b06f  *******/
  const seedCrystal = () => {
    if (currentPhase === 'Supersaturated') {
      setIsSeeded(true);
      showNotification('Seed Crystal Added! Observing rapid crystallization...', 'blue', 3000);
    } else {
      showNotification('You can only add a seed crystal to a Supersaturated solution!', 'red', 3000);
    }
  };

  const resetTrial = () => {
    setSoluteMass(2.0);
    setSolventVolume(100);
    setTemperature(25);
    setIsCooled(false);
    setIsSeeded(false);
    setWasHeated(false);
    setPoints(0);
    setCompletedCheckpoints({});
    showNotification('Trial fully reset. All values cleared.', 'red', 5000);
  };

  const DataBox = ({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) => (
    <div className="p-2 bg-gray-700 rounded">
      <span className="block text-xs text-gray-400">{label}</span>
      <span className={`block font-mono font-bold ${color}`}>{value}</span>
    </div>
  );

  const renderControls = () => (
    <div className="flex justify-center gap-4 flex-wrap p-3 bg-gray-700 rounded-lg">
      <div className="text-center p-2 bg-gray-600 rounded-lg w-40">
        <label className="block text-sm mb-2 font-medium text-yellow-300">Solute Mass (g)</label>
        <input
          type="text"
          value={soluteMass.toFixed(1)}
          onChange={handleMassChange}
          className="w-full text-center mb-1 bg-white text-gray-900 border-2 border-yellow-400 rounded text-base p-1 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <input type="range" min="0" max="70" step="0.1" value={soluteMass} onChange={handleMassChange} className="w-full" />
      </div>

      <div className="text-center p-2 bg-gray-600 rounded-lg w-40">
        <label className="block text-sm mb-2 font-medium text-yellow-300">Temperature (°C)</label>
        <input
          type="text"
          value={temperature}
          onChange={handleTemperatureChange}
          className="w-full text-center mb-1 bg-white text-gray-900 border-2 border-yellow-400 rounded text-base p-1 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <input type="range" min="25" max="80" value={temperature} onChange={handleTemperatureChange} className="w-full" />
      </div>

      <div className="text-center p-2 bg-gray-600 rounded-lg w-40">
        <label className="block text-sm mb-2 font-medium text-yellow-300">Volume (mL)</label>
        <input
          type="text"
          value={solventVolume}
          onChange={handleVolumeChange}
          className="w-full text-center mb-1 bg-white text-gray-900 border-2 border-yellow-400 rounded text-base p-1 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <input type="range" min="50" max="300" step="50" value={solventVolume} onChange={handleVolumeChange} className="w-full" />
      </div>
    </div>
  );

  const renderDataPanel = () => (
    <div className="p-4 bg-gray-900 rounded-lg border-b-2 border-blue-600">
      <h3 className="text-lg font-bold mb-2 text-blue-300">Solution Data</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <DataBox label="Total Solute Added" value={`${soluteMass.toFixed(1)} g`} />
        <DataBox label="Dissolved Solute Mass" value={`${dissolvedMass.toFixed(2)} g`} />
        <DataBox label="Undissolved Solid" value={`${undissolvedMass.toFixed(2)} g`} color={undissolvedMass > 0 ? 'text-red-400' : 'text-green-400'} />
        <DataBox label="Solubility Limit" value={`${solubilityLimit_g.toFixed(2)} g`} />
        <DataBox label="Moles Solute (n)" value={`${dissolved_n_mol.toFixed(4)} mol`} />
        <DataBox label="Molarity (M)" value={`${molarity.toFixed(3)} M`} />
        <DataBox label="Molality (m)" value={`${molality.toFixed(3)} m`} />
        <DataBox label="Solvent Mass" value={`${solventMass_kg.toFixed(3)} kg`} />
      </div>
    </div>
  );

  return (
    <div className="lab-container mx-auto p-4 bg-gray-800 text-white rounded-xl shadow-2xl">
      <h1 className="text-3xl font-extrabold mb-4 text-center text-blue-400">Unit 2: Solutions & Concentration Lab</h1>
      <div className="text-center text-gray-400 mb-2 text-sm">
        Activity ID: <span className="font-mono text-blue-300">{activityID}</span>
      </div>
      <div className="text-center mb-4 px-4 py-2 bg-gray-700/50 rounded-lg">
        <div className={`font-medium text-lg ${notification.color}`}>{notification.message}</div>
      </div>

      <div className="flex gap-6">
        <div className="flex-grow max-w-[600px] mx-auto">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="simulation-canvas w-full rounded-lg mb-4 border-2 border-gray-600" />
          {renderControls()}

          <div className="flex justify-center gap-4 mt-6">
            <button className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-400" onClick={submitCheckpoint}>Submit Checkpoint</button>
            <button className="px-6 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-400" onClick={resetTrial}>Reset Trial</button>
            <div className="flex justify-center mt-4">
              <button
                className={`px-6 py-3 font-bold rounded-full transition
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-500'
                  }`}
                onClick={finalSubmit}
              >
                Final Submit Lab
              </button>
            </div>

          </div>

          <div className="text-center mt-4">
            <button className={`px-6 py-2 rounded-lg font-bold transition ${currentPhase === 'Supersaturated' ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`} onClick={seedCrystal} disabled={currentPhase !== 'Supersaturated'}>
              Add Seed Crystal
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-900 border-2 border-blue-500 rounded-lg">
            <h3 className="font-bold text-blue-300 mb-1 text-sm">Next Step Clue:</h3>
            <p className="text-blue-100 font-medium">{getNextClue()}</p>
          </div>
        </div>

        <div className="w-96 space-y-4">
          {renderDataPanel()}
          <div className="p-4 bg-gray-700 rounded-xl shadow-lg border border-blue-500">
            <h2 className="text-xl font-extrabold text-yellow-300 mb-4 text-center border-b pb-2 border-yellow-500/50">Experiment Checkpoints</h2>
            <div className="space-y-4">
              {Object.entries(CHECKPOINTS).map(([key, cp]) => (
                <div key={key} className={`p-3 rounded-lg transition ${completedCheckpoints[key] ? 'bg-green-800/70 border-l-4 border-green-400' : 'bg-gray-800/70 border-l-4 border-red-400'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold ${completedCheckpoints[key] ? 'text-green-300' : 'text-white'}`}>{cp.name}</h3>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${completedCheckpoints[key] ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>{completedCheckpoints[key] ? 'DONE' : 'PENDING'}</span>
                  </div>
                  <p className="text-sm text-gray-300">{cp.instruction}</p>
                  {completedCheckpoints[key] && feedbacks[key] && (
                    <p className="text-sm text-green-300 font-medium mt-1">Feedback: {feedbacks[key]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600 text-center">
              <p className="font-bold text-lg text-green-400">Total Simulation Points: {points} / 6 (+1 Bonus)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsLab;