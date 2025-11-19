import React, { useState, useEffect, useRef } from "react";

// --- Types ---
type MixtureType = "True Solution" | "Colloid" | "Suspension";
type GameState = "playing" | "reflection" | "finished";
type DraggedItem = "laser" | "filter" | null;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  settled: boolean;
  baseY: number;
}

interface ToolState {
  x: number;
  y: number;
  active: boolean;
}

// --- Constants ---
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const BEAKER_X = 500;
const BEAKER_Y = 320;
const BEAKER_WIDTH = 200;
const BEAKER_HEIGHT = 220;
const LIQUID_LEVEL = 180;

const MIXTURE_PROPERTIES = {
  "True Solution": {
    particleCount: 80,
    particleSize: 2,
    color: "rgba(173, 216, 230, 0.4)", // transparent light blue
    particleColor: "#E0F7FA",
    scattersLight: false,
    settles: false,
    leavesResidue: false,
    speed: 1.5,
  },
  Colloid: {
    particleCount: 150,
    particleSize: 4,
    color: "rgba(255, 255, 255, 0.6)", // translucent
    particleColor: "#F3F4F6",
    scattersLight: true,
    settles: false,
    leavesResidue: false,
    speed: 0.3, // Brownian motion
  },
  Suspension: {
    particleCount: 100,
    particleSize: 7,
    color: "rgba(210, 180, 140, 0.3)", // murky
    particleColor: "#D2B48C",
    scattersLight: true,
    settles: true,
    leavesResidue: true,
    speed: 1.0, // faster settling
  },
};

const LEVELS = {
  1: {
    name: "A. True Solution (Salt + Water)",
    goal: "Observe a homogeneous solution. Stir, use the Laser, and use the Filter.",
    points: 3.0,
    mixtureType: "True Solution" as MixtureType,
    waitTime: 0,
    reflectionText:
      "✅ Correct: Clear solution, no scattering (no Tyndall effect), and no residue after filtration. This confirms a True Solution.",
  },
  2: {
    name: "B. Colloidal Solution (Starch + Water)",
    goal: "Identify light scattering. Stir, use the Laser, use the Filter, and Wait 3 min.",
    points: 3.5,
    mixtureType: "Colloid" as MixtureType,
    waitTime: 180,
    reflectionText:
      "✅ Correct: Translucent appearance, light beam visible (Tyndall effect), and no settling after 3 minutes. This confirms a Colloid.",
  },
  3: {
    name: "C. Suspension (Sand + Water)",
    goal: "Observe settling and filtration. Stir, use the Laser, use the Filter, and Wait 1 min.",
    points: 3.5,
    mixtureType: "Suspension" as MixtureType,
    waitTime: 60,
    reflectionText:
      "✅ Correct: Visible particles, heavy light scattering, and particles settled to the bottom. Residue was left on the filter. This confirms a Suspension.",
  },
};

// =======================================================================
// === 🎨 NEW MODERN DRAWING FUNCTIONS 🎨 ===
// =======================================================================

/**
 * Draws a modern-looking beaker with liquid, sheen, and graduation marks.
 */
function drawBeaker(
  ctx: CanvasRenderingContext2D,
  liquidColor: string,
  liquidTop: number
) {
  ctx.save();

  const beakerLeft = BEAKER_X - BEAKER_WIDTH / 2;
  const beakerRight = BEAKER_X + BEAKER_WIDTH / 2;
  const beakerBottom = BEAKER_Y + BEAKER_HEIGHT;

  // --- 1. Draw Liquid ---
  ctx.fillStyle = liquidColor;
  ctx.fillRect(beakerLeft, liquidTop, BEAKER_WIDTH, beakerBottom - liquidTop);

  // Draw Meniscus (curved top)
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.ellipse(BEAKER_X, liquidTop, BEAKER_WIDTH / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 2. Draw Glass ---
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(beakerLeft, BEAKER_Y);
  ctx.lineTo(beakerLeft, beakerBottom);
  ctx.lineTo(beakerRight, beakerBottom);
  ctx.lineTo(beakerRight, BEAKER_Y);
  ctx.stroke();

  // --- 3. Draw Glass Sheen ---
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(beakerLeft + 10, BEAKER_Y + 10);
  ctx.lineTo(beakerLeft + 10, beakerBottom - 10);
  ctx.stroke();

  // --- 4. Draw Graduation Marks ---
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px Arial";
  const markStart = BEAKER_Y + BEAKER_HEIGHT - 160; // 50ml
  const markInterval = 50; // 50ml
  for (let i = 0; i < 3; i++) {
    const y = markStart + i * markInterval;
    const text = `${50 + i * 50}ml`;
    ctx.fillRect(beakerLeft, y, 15, 1);
    ctx.fillText(text, beakerLeft - 30, y + 4);
  }

  ctx.restore();
}

/**
 * Draws all particles with physics-based effects (glow, alpha).
 */
function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  particleColor: string,
  mixtureType: MixtureType
) {
  ctx.save();
  ctx.fillStyle = particleColor;

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    // Reset properties for each particle
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    if (mixtureType === "Colloid") {
      // Add a glow to represent light scattering
      ctx.shadowColor = "white";
      ctx.shadowBlur = 5;
    } else if (mixtureType === "True Solution") {
      // Make them more transparent
      ctx.globalAlpha = 0.6;
    }

    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draws a modern laser pointer tool and its beam, including the Tyndall effect.
 */
function drawLaser(
  ctx: CanvasRenderingContext2D,
  laser: ToolState,
  scattersLight: boolean,
  beakerLeft: number,
  beakerRight: number,
  liquidTop: number,
  liquidBottom: number
) {
  if (!laser.active) return;
  ctx.save();

  const beamY = laser.y;

  // --- 1. Draw Tool Body ---
  const laserGradient = ctx.createLinearGradient(
    laser.x - 40, 0, laser.x + 40, 0
  );
  laserGradient.addColorStop(0, "#4A5568"); // gray-700
  laserGradient.addColorStop(0.5, "#A0AEC0"); // gray-500
  laserGradient.addColorStop(1, "#4A5568");
  
  ctx.fillStyle = laserGradient;
  ctx.fillRect(laser.x - 40, laser.y - 10, 80, 20);

  // Draw Lens
  ctx.fillStyle = "#E53E3E"; // red-600
  ctx.beginPath();
  ctx.arc(laser.x + 45, laser.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // --- 2. Draw Laser Beam ---
  const beamGradient = ctx.createLinearGradient(
    laser.x + 50, 0, CANVAS_WIDTH, 0
  );
  beamGradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
  beamGradient.addColorStop(1, "rgba(255, 0, 0, 0.0)");

  ctx.strokeStyle = beamGradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(laser.x + 50, beamY);
  ctx.lineTo(CANVAS_WIDTH, beamY);
  ctx.stroke();
  
  // Center glow
  ctx.strokeStyle = "rgba(255, 200, 200, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(laser.x + 50, beamY);
  ctx.lineTo(CANVAS_WIDTH, beamY);
  ctx.stroke();

  // --- 3. Draw Tyndall Effect ---
  if (scattersLight && beamY > liquidTop && beamY < liquidBottom) {
    const tyndallGradient = ctx.createLinearGradient(beakerLeft, 0, beakerRight, 0);
    tyndallGradient.addColorStop(0, "rgba(255, 100, 100, 0.2)");
    tyndallGradient.addColorStop(0.5, "rgba(255, 100, 100, 0.6)");
    tyndallGradient.addColorStop(1, "rgba(255, 100, 100, 0.2)");

    ctx.fillStyle = tyndallGradient;
    ctx.fillRect(beakerLeft, beamY - 6, beakerRight - beakerLeft, 12);
  }

  ctx.restore();
}

/**
 * Draws a modern filter funnel, filter paper, and receiving beaker.
 */
function drawFilter(
  ctx: CanvasRenderingContext2D,
  filter: ToolState,
  leavesResidue: boolean,
  particleColor: string,
  liquidColor: string
) {
  if (!filter.active) return;
  ctx.save();

  const funnelX = filter.x;
  const funnelY = filter.y;

  // --- 1. Draw Receiving Beaker ---
  const beakerBaseY = funnelY + 90;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(funnelX - 25, beakerBaseY - 30, 50, 30);
  
  // --- 2. Draw Funnel ---
  const funnelGradient = ctx.createLinearGradient(
    funnelX - 30, 0, funnelX + 30, 0
  );
  funnelGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  funnelGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
  funnelGradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");
  
  ctx.fillStyle = funnelGradient;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.moveTo(funnelX - 30, funnelY - 20); // Top left
  ctx.lineTo(funnelX + 30, funnelY - 20); // Top right
  ctx.lineTo(funnelX + 10, funnelY + 10); // Bottom right
  ctx.lineTo(funnelX - 10, funnelY + 10); // Bottom left
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stem
  ctx.fillRect(funnelX - 5, funnelY + 10, 10, 40);

  // --- 3. Draw Filter Paper (Cone) ---
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.moveTo(funnelX - 25, funnelY - 18);
  ctx.lineTo(funnelX, funnelY + 5);
  ctx.lineTo(funnelX + 25, funnelY - 18);
  ctx.closePath();
  ctx.fill();
  
  // --- 4. Draw Results ---
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  
  if (leavesResidue) {
    // Draw residue on the filter paper
    ctx.fillStyle = particleColor;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        funnelX - 10 + Math.random() * 20,
        funnelY - 5 + Math.random() * 5,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "black";
    ctx.fillText("Residue", funnelX, funnelY - 25);
    
    // Draw clean liquid in beaker
    ctx.fillStyle = "rgba(173, 216, 230, 0.6)"; // Clean water color
    ctx.fillRect(funnelX - 23, beakerBaseY - 10, 46, 8);
    
  } else {
    // Draw clean filter paper
    ctx.fillStyle = "black";
    ctx.fillText("Clean", funnelX, funnelY - 25);
    
    // Draw original liquid in beaker
    ctx.fillStyle = liquidColor;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(funnelX - 23, beakerBaseY - 10, 46, 8);
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}

// =======================================================================
// === REACT COMPONENT ===
// =======================================================================

const MixturesAdventure = () => {
  // --- STATE VARIABLES ---
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState("");
  const [statusType, setStatusType] = useState("neutral"); // 'neutral', 'success', 'warning'
  const [maxScore, setMaxScore] = useState(0);

  // Simulation-specific state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentMixture, setCurrentMixture] =
    useState<MixtureType>("True Solution");
  const [isStirred, setIsStirred] = useState(false);
  const [settleTimer, setSettleTimer] = useState(0);

  // Draggable Tools State
  const [laser, setLaser] = useState<ToolState>({ x: 150, y: 300, active: false });
  const [filter, setFilter] = useState<ToolState>({ x: 150, y: 450, active: false });
  const [draggedItem, setDraggedItem] = useState<DraggedItem>(null);

  // State to track level completion
  const [actionsPerformed, setActionsPerformed] = useState({
    stirred: false,
    laser: false,
    filtered: false,
    waited: false,
  });

  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrame = useRef<number | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    setMaxScore(Object.values(LEVELS).reduce((sum, level) => sum + level.points, 0));
    setupLevel(1);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // --- PARTICLE CREATION ---
  const initializeParticles = (mixtureType: MixtureType) => {
    const props = MIXTURE_PROPERTIES[mixtureType];
    const newParticles: Particle[] = [];
    const beakerLeft = BEAKER_X - BEAKER_WIDTH / 2 + 10;
    const beakerRight = BEAKER_X + BEAKER_WIDTH / 2 - 10;
    const beakerTop = BEAKER_Y + BEAKER_HEIGHT - LIQUID_LEVEL;
    const beakerBottom = BEAKER_Y + BEAKER_HEIGHT - 10;

    for (let i = 0; i < props.particleCount; i++) {
      newParticles.push({
        id: i,
        x: beakerLeft + Math.random() * (beakerRight - beakerLeft),
        y: beakerTop + Math.random() * (beakerBottom - beakerTop),
        vx: (Math.random() - 0.5) * props.speed,
        vy: (Math.random() - 0.5) * props.speed,
        size: props.particleSize + Math.random() * (props.particleSize / 2),
        settled: false,
        baseY: beakerBottom - 5 - Math.random() * 20, // Stacks particles
      });
    }
    setParticles(newParticles);
  };

  // --- LEVEL MANAGEMENT ---
  const setupLevel = (levelNumber: number) => {
    if (levelNumber > Object.keys(LEVELS).length) {
      setGameState("finished");
      setMessage(`Congratulations! You finished all levels! Final Score: ${score}/${maxScore}`);
      return;
    }

    const level = LEVELS[levelNumber as keyof typeof LEVELS];
    setCurrentLevel(levelNumber);
    setCurrentMixture(level.mixtureType);
    setMessage("Click 'Stir Mixture' to begin.");
    setGameState("playing");
    setStatusType("neutral");
    
    // Reset tools and state
    setLaser(prev => ({ ...prev, active: false }));
    setFilter(prev => ({ ...prev, active: false }));
    setIsStirred(false);
    setSettleTimer(0);
    setActionsPerformed({
      stirred: false,
      laser: false,
      filtered: false,
      waited: false,
    });

    initializeParticles(level.mixtureType);
  };

  const completeLevel = (points: number) => {
    if (gameState !== "playing") return; // Prevent double completion
    setGameState("reflection");
    setScore(s => s + points);
    setMessage(`Level ${currentLevel} complete! You earned ${points} points.`);
    setStatusType("success");
  };

  const handleNextLevel = () => {
    if (currentLevel < Object.keys(LEVELS).length) {
      setupLevel(currentLevel + 1);
    } else {
      setGameState("finished");
      setMessage(`Congratulations! You finished all levels! Final Score: ${score}/${maxScore}`);
    }
  };

  const handleResetGame = () => {
    setScore(0);
    setupLevel(1);
  };

  // --- GAME LOGIC LOOP (THE "ENGINE") ---
  useEffect(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    gameLoopRef.current = setInterval(() => {
      if (gameState !== "playing") return;

      const level = LEVELS[currentLevel as keyof typeof LEVELS];
      const props = MIXTURE_PROPERTIES[currentMixture];
      let newSettleTimer = settleTimer;

      // 1. Update Physics (Settling Timer)
      if (actionsPerformed.stirred && (props.settles || level.waitTime > 0)) {
        newSettleTimer += 0.25;
        setSettleTimer(newSettleTimer);
      }

      // 2. Update Guidance Messages
      if (!actionsPerformed.stirred) {
        setMessage("Click 'Stir Mixture' to begin observing.");
      } else if (!actionsPerformed.laser) {
        setMessage("Good. Now drag the Laser tool to the beaker.");
      } else if (!actionsPerformed.filtered) {
        setMessage("Great. Now drag the Filter tool to the beaker.");
      } else if (level.waitTime > 0 && newSettleTimer < level.waitTime) {
        setMessage(`All tools used. Waiting for observation... (${Math.floor(newSettleTimer)}s / ${level.waitTime}s)`);
        setStatusType("neutral");
      } else {
        setMessage("All observations complete! Level Finished!");
        setStatusType("success");
      }
      
      // 3. Check for Level Completion
      const waitConditionMet = level.waitTime === 0 || newSettleTimer >= level.waitTime;
      
      if (actionsPerformed.stirred && actionsPerformed.laser && actionsPerformed.filtered && waitConditionMet) {
        completeLevel(level.points);
      }

    }, 250); // Game loop ticks every 250ms

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, actionsPerformed, currentLevel, settleTimer]);

  // --- CANVAS ANIMATION & RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const props = MIXTURE_PROPERTIES[currentMixture];

    // Bounding box for particle physics
    const beakerLeft = BEAKER_X - BEAKER_WIDTH / 2 + 10;
    const beakerRight = BEAKER_X + BEAKER_WIDTH / 2 - 10;
    const beakerTop = BEAKER_Y + BEAKER_HEIGHT - LIQUID_LEVEL;
    const beakerBottom = BEAKER_Y + BEAKER_HEIGHT - 10;

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // --- Draw Beaker & Liquid ---
      drawBeaker(
        ctx,
        props.color,
        beakerTop
      );

      // --- Update and Draw Particles ---
      particles.forEach(p => {
        // Physics update
        if (isStirred) {
          // Rapid, random motion
          p.x += (Math.random() - 0.5) * 15;
          p.y += (Math.random() - 0.5) * 15;
          p.settled = false;
        } else if (props.settles && settleTimer > 5) {
          // Settling (Suspension)
          if (p.y < p.baseY) {
            p.y += props.speed; // Gravity
          } else {
            p.settled = true;
            p.x += (Math.random() - 0.5) * 0.1; // Jitter at bottom
          }
        } else if (currentMixture === "Colloid") {
          // Brownian Motion
          p.vx = (Math.random() - 0.5) * props.speed;
          p.vy = (Math.random() - 0.5) * props.speed;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Diffusion (True Solution)
          p.x += p.vx;
          p.y += p.vy;
        }

        // Wall collisions
        if (p.x < beakerLeft) { p.x = beakerLeft; p.vx *= -1; }
        if (p.x > beakerRight) { p.x = beakerRight; p.vx *= -1; }
        if (p.y < beakerTop) { p.y = beakerTop; p.vy *= -1; }
        if (p.y > beakerBottom) { p.y = beakerBottom; p.vy *= -1; }
        if (p.settled) { p.y = p.baseY; }
      });
      
      // Draw particles (now happens in its own function)
      drawParticles(ctx, particles, props.particleColor, currentMixture);


      // --- Draw Laser Tool ---
      drawLaser(
        ctx,
        laser,
        props.scattersLight,
        BEAKER_X - BEAKER_WIDTH / 2, // beakerLeft (wall)
        BEAKER_X + BEAKER_WIDTH / 2, // beakerRight (wall)
        beakerTop,
        beakerBottom
      );
      
      // --- Draw Filter Tool ---
      drawFilter(
        ctx,
        filter,
        props.leavesResidue,
        props.particleColor,
        props.color
      );

      animFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [currentMixture, particles, isStirred, laser, filter, settleTimer, gameState]);


  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DraggedItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !draggedItem || gameState !== "playing") return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedItem === "laser") {
      setLaser({ x, y, active: true });
      setActionsPerformed(prev => ({ ...prev, laser: true }));
    } else if (draggedItem === "filter") {
      setFilter({ x, y, active: true });
      setActionsPerformed(prev => ({ ...prev, filtered: true }));
    }
    setDraggedItem(null);
  };

  // --- BUTTON HANDLERS ---
  const handleStirClick = () => {
    if (gameState !== "playing") return;
    setIsStirred(true);
    setActionsPerformed(prev => ({ ...prev, stirred: true }));
    // Reset settle timer on stir
    setSettleTimer(0);
    // Reset particle physics
    setParticles(pList => pList.map(p => ({...p, settled: false})));
    // Stir animation lasts 1.5 seconds
    setTimeout(() => setIsStirred(false), 1500);
  };

  const handleResetControls = () => {
    // Resets tools for the *current* level
    setLaser(prev => ({ ...prev, active: false }));
    setFilter(prev => ({ ...prev, active: false }));
    setIsStirred(false);
    setSettleTimer(0);
    setActionsPerformed({
      stirred: false,
      laser: false,
      filtered: false,
      waited: false,
    });
    setMessage("Tools reset. Click 'Stir Mixture' to start again.");
    setStatusType("neutral");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      {/* --- MODAL STYLES --- */}
      <style>{`
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
          }
          .modal-content {
            background: white; padding: 2rem; border-radius: 12px;
            border: 4px solid #8b5cf6; max-width: 500px;
            width: 90%; text-align: center; color: #333;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }
          .modal-content h2 { font-size: 2rem; font-weight: bold; color: #6d28d9; margin-bottom: 1rem; }
          .modal-content h3 { font-size: 1.25rem; font-weight: bold; color: #333; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 2px solid #ddd; padding-bottom: 0.5rem; }
          .modal-content p { font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
          .modal-button {
            background-color: #8b5cf6; color: white; font-weight: bold;
            padding: 0.75rem 1.5rem; border-radius: 8px; border: none;
            cursor: pointer; font-size: 1.1rem; transition: background-color 0.2s;
          }
          .modal-button:hover { background-color: #7c3aed; }
        `}</style>

      {/* --- MODALS --- */}
      {(gameState === 'reflection' || gameState === 'finished') && (
        <div className="modal-overlay">
          <div className="modal-content">
            {gameState === 'reflection' ? (
              <>
                <h2>Level {currentLevel} Complete!</h2>
                <p>You earned <strong>{LEVELS[currentLevel as keyof typeof LEVELS].points} points.</strong></p>
                <h3>Reflection:</h3>
                <p>{LEVELS[currentLevel as keyof typeof LEVELS].reflectionText}</p>
                <button className="modal-button" onClick={handleNextLevel}>
                  {currentLevel < Object.keys(LEVELS).length ? 'Next Level' : 'Finish Game'}
                </button>
              </>
            ) : ( // gameState === 'finished'
              <>
                <h2>Congratulations!</h2>
                <p>You have completed all simulations!</p>
                <p>Your final score is: <strong>{score.toFixed(1)} / {maxScore.toFixed(1)}</strong></p>
                <button className="modal-button" onClick={handleResetGame}>
                  Restart Simulation
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MAIN UI --- */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 p-4 bg-gray-800 rounded-xl shadow-lg">
          <h1 className="text-5xl font-bold text-purple-300 mb-2">🧪 Mixtures & Dispersions Lab</h1>
          <p className="text-xl text-purple-200">Suspension, Colloidal Solution & True Solution</p>
        </div>
        <div className="flex justify-center mb-4 space-x-4">
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-xl shadow-md">Score: {score.toFixed(1)}/{maxScore.toFixed(1)}</div>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-md">Part: {currentLevel} ({LEVELS[currentLevel as keyof typeof LEVELS].name})</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* --- TOOLS & CONTROLS --- */}
          <div className="bg-gray-800 rounded-xl p-4 border-2 border-yellow-400 shadow-inner space-y-4">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 border-b border-yellow-400 pb-2">🔧 Tools</h2>
            {/* Draggable Laser */}
            <div
              draggable
              onDragStart={e => handleDragStart(e, "laser")}
              className="p-4 rounded-lg cursor-grab bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-center font-semibold shadow-lg transform hover:scale-105 transition-all"
            >
              🔦 Laser Pointer
            </div>
            {/* Draggable Filter */}
            <div
              draggable
              onDragStart={e => handleDragStart(e, "filter")}
              className="p-4 rounded-lg cursor-grab bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white text-center font-semibold shadow-lg transform hover:scale-105 transition-all"
            >
              ⚗️ Filter Funnel
            </div>
            
            <h2 className="text-2xl font-bold text-yellow-300 mt-6 border-b border-yellow-400 pb-2">⚙️ Actions</h2>
            {/* Stir Button */}
            <button
              onClick={handleStirClick}
              disabled={isStirred}
              className="w-full bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 py-3 rounded-lg font-bold text-white text-center shadow-lg transform hover:scale-105 transition-all disabled:from-gray-500 disabled:to-gray-700 disabled:cursor-not-allowed"
            >
              {isStirred ? 'Stirring...' : 'Stir Mixture'}
            </button>
            {/* Reset Tools Button */}
            <button
              onClick={handleResetControls}
              className="w-full bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 py-3 rounded-lg font-bold text-white text-center shadow-lg transform hover:scale-105 transition-all"
            >
              Reset Tools
            </button>
            {/* Reset Game Button */}
            <button
              onClick={handleResetGame}
              className="w-full bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 py-3 rounded-lg font-bold text-white text-center shadow-lg transform hover:scale-105 transition-all"
            >
              Reset Game
            </button>
          </div>

          {/* --- CANVAS --- */}
          <div className="col-span-1 lg:col-span-4 bg-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-full"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          </div>
        </div>

        {/* --- MESSAGE & INFO PANEL --- */}
        <div className={`mt-4 bg-gray-800 rounded-xl p-4 border-4 ${
            statusType === 'success' ? 'border-green-500' :
            statusType === 'warning' ? 'border-red-500' :
            'border-purple-300'
          } shadow-lg transition-colors duration-300`}>
          <h3 className="text-xl font-bold text-purple-200 mb-2">Current Objective:</h3>
          <p className="text-lg text-white mb-2">{LEVELS[currentLevel as keyof typeof LEVELS].goal}</p>
          <h3 className={`text-xl font-bold mb-2 ${
              statusType === 'success' ? 'text-green-400' :
              statusType === 'warning' ? 'text-red-400' :
              'text-yellow-300'
            }`}>Status:</h3>
          <p className={`text-lg ${
              statusType === 'success' ? 'text-green-300' :
              statusType === 'warning' ? 'text-red-300' :
              'text-yellow-100'
            }`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MixturesAdventure;