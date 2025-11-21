import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

type SoluteDef = {
  name: string;
  molarMass: number;
  baseSolubility_g_per_100ml_at25C: number;
  tempCoeff: number;
};

const SOLUTES: Record<string, SoluteDef> = {
  NaCl: { name: "NaCl", molarMass: 58.44, baseSolubility_g_per_100ml_at25C: 36.0, tempCoeff: 0.02 },
  KNO3: { name: "KNO3", molarMass: 101.1, baseSolubility_g_per_100ml_at25C: 13.3, tempCoeff: 0.5 },
  Sugar: { name: "Sugar (sucrose)", molarMass: 342.3, baseSolubility_g_per_100ml_at25C: 200, tempCoeff: 0.8 }
};

const PhaseChangeAdventure3D: React.FC = () => {
  // UI state
  const [temperature, setTemperature] = useState<number>(25);
  const [solventVolumeMl, setSolventVolumeMl] = useState<number>(100);
  const [selectedSolute, setSelectedSolute] = useState<string>("NaCl");
  const [pendingAddMass, setPendingAddMass] = useState<number>(1);
  const [dissolvedMass, setDissolvedMass] = useState<number>(0);
  const [undissolvedMass, setUndissolvedMass] = useState<number>(0);
  const [status, setStatus] = useState<string>("Unsaturated");
  const [interactionMode, setInteractionMode] = useState<'pick' | 'pan'>('pick');
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [currentPart, setCurrentPart] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [score, setScore] = useState(0);
  const [partCompleted, setPartCompleted] = useState(false);
  const [levelsLog, setLevelsLog] = useState<string[]>([]);
  const [floatingHint, setFloatingHint] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [stirCount, setStirCount] = useState(0); // Track number of stirs
  const [hasReachedSaturation, setHasReachedSaturation] = useState(false); // Track if saturation was reached
  const [nextStepCountdown, setNextStepCountdown] = useState<number | null>(null); // Countdown to next step
  const [availableCrystals, setAvailableCrystals] = useState(12); // Track available NaCl crystals
  const [addedCrystals, setAddedCrystals] = useState(0); // Track crystals added to beaker

  // Drag/drop & scene refs
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const isDragging = useRef(false);
  const draggedMeshRef = useRef<THREE.Object3D | null>(null);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const interactionModeRef = useRef<'pick' | 'pan'>('pick');

  // 3D object refs
  const beakerRef = useRef<THREE.Mesh | null>(null);
  const solventParticlesRef = useRef<THREE.Mesh[]>([]);
  const soluteCrystalsRef = useRef<THREE.Mesh[]>([]);
  const stirRef = useRef<THREE.Object3D | null>(null);
  const seedRef = useRef<THREE.Object3D | null>(null);
  const ionToggleRef = useRef<THREE.Object3D | null>(null);
  const tableRef = useRef<THREE.Mesh | null>(null);
  const placeholderRef = useRef<THREE.Mesh | null>(null);
  const flamesRef = useRef<THREE.Mesh[]>([]);
  const vaporParticlesRef = useRef<THREE.Mesh[]>([]);
  const condensationRef = useRef<THREE.Mesh[]>([]);
  const coolingPlateRef = useRef<THREE.Group | null>(null);
  const burnerRef = useRef<THREE.Group | null>(null);
  const dragCardRef = useRef<HTMLDivElement>(null);
  const pickButtonRef = useRef<THREE.Mesh | null>(null);
  const panButtonRef = useRef<THREE.Mesh | null>(null);

  // Constants / helpers
  const beakerPos = { x: 0, z: 0 };
  const beakerRadius = 1.4;
  const beakerHeight = 4;

  const computeSolubility_g_per_100ml = (soluteKey: string, T: number) => {
    const def = SOLUTES[soluteKey];
    return Math.max(0.1, def.baseSolubility_g_per_100ml_at25C + def.tempCoeff * (T - 25));
  };

  const computeMoles = (soluteKey: string, mass_g: number) => {
    return mass_g / SOLUTES[soluteKey].molarMass;
  };

  const computeMolarity = (soluteKey: string, mass_g: number, volume_ml: number) => {
    const n = computeMoles(soluteKey, mass_g);
    const V_L = Math.max(0.001, volume_ml / 1000);
    return n / V_L;
  };

  const computeMolality = (soluteKey: string, mass_g: number, volume_ml: number) => {
    const n = computeMoles(soluteKey, mass_g);
    const kgSolvent = Math.max(0.001, volume_ml / 1000);
    return n / kgSolvent;
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const logLevelAction = (action: string) => {
    setLevelsLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${action}`]);
  };

  const resetPartState = () => {
    setDissolvedMass(0);
    setUndissolvedMass(0);
    setStatus("Unsaturated");
    setTemperature(25);
    setSolventVolumeMl(100);
    setCurrentStep(0);
    setPartCompleted(false);
    setStirCount(0); // Reset stir count
    setHasReachedSaturation(false); // Reset saturation flag
    setAddedCrystals(0); // Reset added crystals count
    // Remove old crystals
    if (sceneRef.current && soluteCrystalsRef.current) {
      soluteCrystalsRef.current.forEach(crystal => {
        if (sceneRef.current) {
          sceneRef.current.remove(crystal);
        }
      });
      soluteCrystalsRef.current = [];
    }
    // Replenish NaCl crystals (or selected solute) on the table
    if (sceneRef.current) {
      const crystalGeom = new THREE.BoxGeometry(0.25, 0.15, 0.25);
      const crystalMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
      for (let i = 0; i < 12; i++) {
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        crystal.position.set(-2.5 + i * 0.5, 0.9, 2);
        crystal.userData = { type: "soluteCrystal", solute: selectedSolute, mass: 1 };
        sceneRef.current.add(crystal);
        soluteCrystalsRef.current.push(crystal);
        crystal.castShadow = true;
      }
      setAvailableCrystals(12); // Reset counter
    }
  };

  const replenishCrystals = () => {
    if (!sceneRef.current) return;

    const crystalGeom = new THREE.BoxGeometry(0.25, 0.15, 0.25);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const newCrystals = 12;

    for (let i = 0; i < newCrystals; i++) {
      const crystal = new THREE.Mesh(crystalGeom, crystalMat);
      crystal.position.set(-2.5 + i * 0.5, 0.9, 2);
      crystal.userData = { type: "soluteCrystal", solute: selectedSolute, mass: 1 };
      sceneRef.current.add(crystal);
      soluteCrystalsRef.current.push(crystal);
      crystal.castShadow = true;
    }

    setAvailableCrystals(prev => prev + newCrystals);
    showNotification('success', `🧂 Replenished ${newCrystals} NaCl crystals!`);
    logLevelAction(`Replenished ${newCrystals} crystals`);
  };


  const advancePart = () => {
    resetPartState();

    if (currentPart === 'A') {
      setCurrentPart('B');
      showNotification('success', '🎉 Part A Complete! Starting Part B...');
      setScore(s => s + 25);
    } else if (currentPart === 'B') {
      setCurrentPart('C');
      showNotification('success', '🎉 Part B Complete! Starting Part C...');
      setScore(s => s + 25);
    } else if (currentPart === 'C') {
      setCurrentPart('D');
      showNotification('success', '🎉 Part C Complete! Starting Part D...');
      setScore(s => s + 25);
    } else if (currentPart === 'D') {
      showNotification('success', '🏆 All Parts Complete! You mastered Solutions & Concentration!');
      setScore(s => s + 25);
    }

    logLevelAction(`Advanced to Part ${currentPart}`);
  };

  // Define comprehensive step-by-step instructions for each part
  const INSTRUCTIONS = {
    'A': [
      { step: 1, text: '🔧 Set Temperature to 25°C using the slider', check: () => temperature === 25 },
      { step: 2, text: '💧 Set Volume to 100 mL', check: () => solventVolumeMl === 100 },
      { step: 3, text: '🧂 Select NaCl as the solute', check: () => selectedSolute === 'NaCl' },
      { step: 4, text: '➕ Drag 2 NaCl crystals (2g total) to the beaker', check: () => dissolvedMass >= 2 },
      { step: 5, text: '🌀 Drag the stir paddle to mix until clear', check: () => undissolvedMass === 0 && dissolvedMass >= 2 },
      { step: 6, text: '✅ Solution is UNSATURATED! Click Submit to continue.', check: () => status === 'Unsaturated' && dissolvedMass >= 2 }
    ],
    'B': [
      { step: 1, text: '📋 Keep current setup (25°C, 100mL, NaCl)', check: () => temperature === 25 && solventVolumeMl === 100 },
      { step: 2, text: '➕ Add 10 NaCl crystals (10g) to the beaker by dragging them one by one', check: () => dissolvedMass >= 10 || undissolvedMass > 0 },
      { step: 3, text: '🌀 Stir the solution 2 times (drag stir paddle to beaker twice)', check: () => stirCount >= 2 },
      { step: 4, text: '🔁 Add 26 more NaCl crystals (26g) - total should be ~36g to reach saturation', check: () => undissolvedMass > 0 && dissolvedMass >= 30 },
      { step: 5, text: '🎯 SATURATION POINT REACHED! Crystals remain at bottom (36g dissolved).', check: () => undissolvedMass > 0 && status === 'Saturated' && hasReachedSaturation },
      { step: 6, text: '✅ Solution is saturated! Ready to continue.', check: () => undissolvedMass > 0 && hasReachedSaturation }
    ],
    'C': [
      { step: 1, text: '🔥 Increase Temperature to 60-70°C', check: () => temperature >= 60 && temperature <= 70 },
      { step: 2, text: '🌀 Stir repeatedly until all solids disappear', check: () => undissolvedMass === 0 },
      { step: 3, text: '❄️ Cool back to 25°C', check: () => temperature === 25 },
      { step: 4, text: '👀 Confirm solution stays clear (supersaturated)', check: () => status === 'Supersaturated' },
      { step: 5, text: '🌱 Drag seed crystal to beaker to trigger crystallization', check: () => undissolvedMass > 0 },
      { step: 6, text: '✅ Crystals formed! Click Submit to continue.', check: () => undissolvedMass > 0 }
    ],
    'D': [
      { step: 1, text: '🔄 Click Reset to start fresh', check: () => dissolvedMass === 0 && undissolvedMass === 0 },
      { step: 2, text: '🌡️ Test at different temperatures (25°C, 40°C, 60°C)', check: () => true },
      { step: 3, text: '➕ Add 1.00 g NaCl at a time until saturation', check: () => undissolvedMass > 0 },
      { step: 4, text: '📊 Observe how temperature affects solubility', check: () => true },
      { step: 5, text: '✅ Complete all three temperature tests!', check: () => true }
    ]
  };

  // Get current instructions
  const currentInstructions = INSTRUCTIONS[currentPart];
  const currentStepData = currentInstructions[currentStep];

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (interactionMode !== 'pick') return;
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      if (obj.userData && obj.userData.type === 'button') {
        obj.userData.onClick();
        return;
      }
    }

    if (interactionMode !== 'pick') return;

    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      if (obj.userData && obj.userData.type === "soluteCrystal") {
        isDragging.current = true;
        draggedMeshRef.current = obj;
        setDraggedItem(obj.userData.solute);
        obj.position.y = 2.5;
        if (placeholderRef.current) placeholderRef.current.visible = true;
        showNotification('info', `Dragging ${obj.userData.solute} (${obj.userData.mass} g)`);
        if (controlsRef.current) controlsRef.current.enabled = false;
        return;
      } else if (obj.userData && obj.userData.type === "stir") {
        isDragging.current = true;
        draggedMeshRef.current = obj;
        setDraggedItem('stir');
        obj.position.y = 2.5;
        showNotification('info', `Dragging Stir Paddle`);
        if (controlsRef.current) controlsRef.current.enabled = false;
        return;
      } else if (obj.userData && obj.userData.type === "seed") {
        isDragging.current = true;
        draggedMeshRef.current = obj;
        setDraggedItem('seed');
        obj.position.y = 2.5;
        showNotification('info', `Dragging Seed Crystal`);
        if (controlsRef.current) controlsRef.current.enabled = false;
        return;
      } else if (obj.userData && obj.userData.type === "ionToggle") {
        isDragging.current = true;
        draggedMeshRef.current = obj;
        setDraggedItem('ionToggle');
        obj.position.y = 2.5;
        showNotification('info', `Dragging Ion Toggle`);
        if (controlsRef.current) controlsRef.current.enabled = false;
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (interactionMode !== 'pick') return;
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);
    let found = false;
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      if (obj.userData && (obj.userData.type === "soluteCrystal" || obj.userData.type === "stir" || obj.userData.type === "seed" || obj.userData.type === "ionToggle")) {
        setHoveredObject(obj.userData.type);
        found = true;
        break;
      }
    }
    if (!found) setHoveredObject(null);

    if (isDragging.current && draggedMeshRef.current) {
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(dragPlane.current, target);
      draggedMeshRef.current.position.set(target.x, 2.2 + Math.sin(Date.now() * 0.005) * 0.15, target.z);
    }

    if (dragCardRef.current) {
      dragCardRef.current.style.transform = `translate(${e.clientX + 20}px, ${e.clientY + 20}px)`;
    }
  };

  const handleMouseUp = () => {
    if (interactionMode !== 'pick') return;
    // Only process mouse up when in pick mode or if dragging
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!draggedMeshRef.current || !sceneRef.current) return;

    const pos = draggedMeshRef.current.position;
    const dx = pos.x - beakerPos.x;
    const dz = pos.z - beakerPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (draggedItem === 'stir' || draggedItem === 'seed' || draggedItem === 'ionToggle') {
      if (dist < beakerRadius + 0.6) {
        if (draggedItem === 'stir') {
          stirAction();
        } else if (draggedItem === 'seed') {
          seedAction();
        } else if (draggedItem === 'ionToggle') {
          toggleIonsAction();
        }
        // Reset to table
        resetCrystalToTable(draggedMeshRef.current);
      } else {
        // Reset to table if not near beaker
        resetCrystalToTable(draggedMeshRef.current);
      }
    } else if (draggedItem) {
      // Handle solute crystal drop
      if (dist < beakerRadius + 0.6 && pos.y < 3.5) {
        const mass = draggedMeshRef.current.userData.mass as number;
        const soluteKey = draggedMeshRef.current.userData.solute as string;

        const solubility_g_per_100ml = computeSolubility_g_per_100ml(soluteKey, temperature);
        const maxDissolve_g = solubility_g_per_100ml * (solventVolumeMl / 100);

        const currentlyDissolved = dissolvedMass;
        const freeCapacity = Math.max(0, maxDissolve_g - currentlyDissolved);

        if (freeCapacity >= mass) {
          setDissolvedMass(d => d + mass);
          dissolveCrystalIntoIons(draggedMeshRef.current, soluteKey, mass);
          if (sceneRef.current) sceneRef.current.remove(draggedMeshRef.current);
          if (soluteCrystalsRef.current) soluteCrystalsRef.current = soluteCrystalsRef.current.filter(m => m !== draggedMeshRef.current);
          setAvailableCrystals(prev => prev - 1); // Decrement crystal count
          setAddedCrystals(prev => prev + 1); // Increment added crystals count
          showNotification('success', `Dissolved ${mass} g of ${soluteKey}`);
          logLevelAction(`Dissolved ${mass} g of ${soluteKey}`);

          // Show success animation
          setShowSuccessAnimation(true);
          setTimeout(() => setShowSuccessAnimation(false), 2000);

          // Comprehensive success message
          const molarity = computeMolarity(soluteKey, dissolvedMassRef.current + mass, solventVolumeMlRef.current);
          showNotification('success', `✅ ${mass}g ${soluteKey} dissolved! Molarity: ${molarity.toFixed(3)} M`);
        } else if (freeCapacity > 0) {
          setDissolvedMass(d => d + freeCapacity);
          setUndissolvedMass(u => u + (mass - freeCapacity));
          dissolveCrystalIntoIons(draggedMeshRef.current, soluteKey, freeCapacity);
          draggedMeshRef.current.userData.mass = mass - freeCapacity;
          draggedMeshRef.current.position.set(
            beakerPos.x + (Math.random() - 0.5) * 0.4,
            0.5,
            beakerPos.z + (Math.random() - 0.5) * 0.4
          );
          showNotification('info', `⚠️ Partially dissolved ${freeCapacity.toFixed(2)} g. ${(mass - freeCapacity).toFixed(2)} g undissolved. Approaching saturation!`);
          logLevelAction(`Partially dissolved ${freeCapacity} g of ${soluteKey}`);
        } else {
          setUndissolvedMass(u => u + mass);
          draggedMeshRef.current.position.set(
            beakerPos.x + (Math.random() - 0.5) * 0.4,
            0.5,
            beakerPos.z + (Math.random() - 0.5) * 0.4
          );
          showNotification('error', '🛑 Solution is SATURATED! No more can dissolve. Try heating or seeding!');
          logLevelAction(`Failed to dissolve ${mass} g of ${soluteKey} - saturated`);
        }
      } else {
        resetCrystalToTable(draggedMeshRef.current);
      }
    }

    draggedMeshRef.current = null;
    setDraggedItem(null);
    if (placeholderRef.current) placeholderRef.current.visible = false;
    if (controlsRef.current) controlsRef.current.enabled = interactionMode === 'pan';
  };

  const dissolveCrystalIntoIons = (crystal: THREE.Object3D, soluteKey: string, mass_g: number) => {
    if (!sceneRef.current) return;
    const n = Math.max(6, Math.round(6 * (mass_g / 5)));
    for (let i = 0; i < n; i++) {
      const geom = new THREE.SphereGeometry(0.05, 6, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffaa, transparent: true, opacity: 0.95 });
      const ion = new THREE.Mesh(geom, mat);
      ion.position.set(
        beakerPos.x + (Math.random() - 0.5) * beakerRadius * 0.8,
        1 + Math.random() * (beakerHeight * 0.5),
        beakerPos.z + (Math.random() - 0.5) * beakerRadius * 0.8
      );
      ion.userData = { lifetime: 200 + Math.random() * 400 };
      sceneRef.current.add(ion);
      solventParticlesRef.current.push(ion);
    }
  };

  const resetCrystalToTable = (mesh: THREE.Object3D) => {
    mesh.position.set(-3 + Math.random() * 0.6, 0.9, 3 + Math.random() * 0.6);
  };

  const stirAction = () => {
    setStirCount(c => c + 1); // Increment stir count
    const dissolveAmount = Math.min(undissolvedMass, 1);
    if (dissolveAmount > 0) {
      setDissolvedMass(d => d + dissolveAmount);
      setUndissolvedMass(u => u - dissolveAmount);
      showNotification('success', `🌀 Stirred! Dissolved ${dissolveAmount.toFixed(2)} g from the bottom. Keep stirring to dissolve more!`);
      logLevelAction(`Stirred - dissolved ${dissolveAmount} g`);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 1500);
    } else {
      showNotification('info', '🌀 Stirred the solution. All solute is already dissolved or solution is saturated.');
    }
  };

  const seedAction = () => {
    if (dissolvedMass > computeSolubility_g_per_100ml(selectedSolute, temperature) * (solventVolumeMl / 100) + 1e-3) {
      const precipMass = Math.min(Math.max(1, (dissolvedMass - computeSolubility_g_per_100ml(selectedSolute, temperature) * (solventVolumeMl / 100)) * 0.5), dissolvedMass);
      setDissolvedMass(d => Math.max(0, d - precipMass));
      setUndissolvedMass(u => u + precipMass);
      showNotification('success', `🌱 Seed crystal worked! ${precipMass.toFixed(2)} g precipitated from supersaturated solution!`);
      logLevelAction(`Seeded - precipitated ${precipMass} g`);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    } else {
      showNotification('error', '❌ Solution is NOT supersaturated. Heat it up, add more solute, then cool it before seeding!');
    }
  };

  const toggleIonsAction = () => {
    // Toggle ion visibility (simplified)
    showNotification('info', '⚛️ Ion visibility toggled! Observe how solute breaks into ions in solution.');
    logLevelAction('Toggled ion visibility');
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Clean up existing scene if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 9);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.enabled = interactionModeRef.current === 'pan';
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    dir.castShadow = true;
    dir.shadow.camera.left = -15;
    dir.shadow.camera.right = 15;
    dir.shadow.camera.top = 15;
    dir.shadow.camera.bottom = -15;
    scene.add(dir);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    scene.add(gridHelper);

    // Beaker
    const beakerGeo = new THREE.CylinderGeometry(beakerRadius, beakerRadius, beakerHeight, 32, 1, true);
    const beakerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      transmission: 0.95,
      roughness: 0.1,
      metalness: 0
    });
    const beaker = new THREE.Mesh(beakerGeo, beakerMat);
    beaker.position.set(beakerPos.x, beakerHeight / 2, beakerPos.z);
    scene.add(beaker);
    beakerRef.current = beaker;
    beaker.castShadow = true;
    beaker.raycast = () => { }; // Disable raycasting to allow dragging objects behind

    // Liquid
    const liquidGeo = new THREE.CylinderGeometry(beakerRadius - 0.05, beakerRadius - 0.05, 0.05, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.8, roughness: 0.2 });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(beakerPos.x, 0.5, beakerPos.z);
    scene.add(liquid);
    liquid.raycast = () => { }; // Disable raycasting for liquid

    // Placeholder for crystal drop
    const placeholderCrystalGeo = new THREE.CylinderGeometry(beakerRadius + 0.5, beakerRadius + 0.5, 0.1, 32);
    const placeholderCrystalMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const placeholderCrystal = new THREE.Mesh(placeholderCrystalGeo, placeholderCrystalMat);
    placeholderCrystal.position.set(beakerPos.x, 0.1, beakerPos.z);
    placeholderCrystal.visible = false;
    scene.add(placeholderCrystal);
    placeholderRef.current = placeholderCrystal;

    // Solvent particles
    const particleGeom = new THREE.SphereGeometry(0.07, 6, 6);
    for (let i = 0; i < 120; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x99d6ff, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(particleGeom, mat);
      p.position.set(
        beakerPos.x + (Math.random() - 0.5) * beakerRadius * 1.2,
        1 + Math.random() * 1.4,
        beakerPos.z + (Math.random() - 0.5) * beakerRadius * 1.2
      );
      scene.add(p);
      solventParticlesRef.current.push(p);
    }

    // Table
    const tableGeo = new THREE.BoxGeometry(4, 0.2, 1);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.2, 2);
    scene.add(table);
    tableRef.current = table;
    table.castShadow = true;
    table.receiveShadow = true;

    // Assets on table
    const crystalGeom = new THREE.BoxGeometry(0.25, 0.15, 0.25);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    for (let i = 0; i < 12; i++) {
      const crystal = new THREE.Mesh(crystalGeom, crystalMat);
      crystal.position.set(-2.5 + i * 0.5, 0.9, 2);
      crystal.userData = { type: "soluteCrystal", solute: selectedSolute, mass: 1 };
      scene.add(crystal);
      soluteCrystalsRef.current.push(crystal);
      crystal.castShadow = true;
    }

    // Stir paddle
    const stirGeo = new THREE.BoxGeometry(0.3, 0.1, 0.1);
    const stirMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const stir = new THREE.Mesh(stirGeo, stirMat);
    stir.position.set(0.5, 0.9, 2);
    stir.userData = { type: "stir" };
    scene.add(stir);
    stirRef.current = stir;
    stir.castShadow = true;

    // Seed crystal
    const seedGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(1, 0.9, 2);
    seed.userData = { type: "seed" };
    scene.add(seed);
    seedRef.current = seed;
    seed.castShadow = true;

    // Ion toggle
    const toggleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
    const toggleMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const toggle = new THREE.Mesh(toggleGeo, toggleMat);
    toggle.position.set(1.5, 0.9, 2);
    toggle.userData = { type: "ionToggle" };
    scene.add(toggle);
    ionToggleRef.current = toggle;
    toggle.castShadow = true;

    // Create 3D buttons for Pick and Pan
    const createButton = (text: string, position: THREE.Vector3, isActive: boolean, onClick: () => void) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = isActive ? '#2563eb' : '#4b5563'; // Blue if active, gray if not
      ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, 256, 128);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 128, 80);
      const texture = new THREE.CanvasTexture(canvas);
      const geometry = new THREE.PlaneGeometry(2, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData = { type: 'button', onClick, text };
      scene.add(mesh);
      return mesh;
    };

    const pickButton = createButton('Pick', new THREE.Vector3(0, 0, 0), interactionMode === 'pick', () => setInteractionMode('pick'));
    const panButton = createButton('Pan', new THREE.Vector3(0, 0, 0), interactionMode === 'pan', () => setInteractionMode('pan'));

    pickButtonRef.current = pickButton;
    panButtonRef.current = panButton;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update button positions to follow camera
      if (cameraRef.current && pickButtonRef.current) {
        const camPos = cameraRef.current.position;
        pickButtonRef.current.position.set(camPos.x - 4, camPos.y + 1, camPos.z + 3);
        pickButtonRef.current.lookAt(camPos);
      }
      if (cameraRef.current && panButtonRef.current) {
        const camPos = cameraRef.current.position;
        panButtonRef.current.position.set(camPos.x - 4, camPos.y - 1, camPos.z + 3);
        panButtonRef.current.lookAt(camPos);
      }

      // Floating animation
      soluteCrystalsRef.current.forEach((c: THREE.Mesh) => {
        c.rotation.y += 0.01;
        c.position.y = 0.9 + Math.sin(Date.now() * 0.002 + (c.id || 0)) * 0.02;
      });
      if (stirRef.current) stirRef.current.position.y = 0.9 + Math.sin(Date.now() * 0.002) * 0.02;
      if (seedRef.current) seedRef.current.position.y = 0.9 + Math.sin(Date.now() * 0.002 + 1) * 0.02;
      if (ionToggleRef.current) ionToggleRef.current.position.y = 0.9 + Math.sin(Date.now() * 0.002 + 2) * 0.02;

      // Animate placeholder pulse
      if (placeholderRef.current && placeholderRef.current.visible) {
        const time = Date.now() * 0.005;
        (placeholderRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time) * 0.2;
      }

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (renderer.domElement && mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  // Sync interaction mode to ref for event handlers
  useEffect(() => {
    interactionModeRef.current = interactionMode;
    if (controlsRef.current) {
      controlsRef.current.enabled = interactionMode === 'pan';
    }
    // Update cursor immediately
    if (rendererRef.current) {
      rendererRef.current.domElement.style.cursor = interactionMode === 'pick' ? 'default' : 'grab';
    }
  }, [interactionMode]);

  // Update button textures based on interaction mode
  useEffect(() => {
    const updateButtonTexture = (buttonRef: React.MutableRefObject<THREE.Mesh | null>, text: string, isActive: boolean) => {
      if (buttonRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = isActive ? '#2563eb' : '#4b5563';
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 256, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 80);
        const texture = new THREE.CanvasTexture(canvas);
        const material = buttonRef.current.material as THREE.MeshBasicMaterial;
        material.map = texture;
        if (material.map) {
          material.map.needsUpdate = true;
        }
      }
    };

    updateButtonTexture(pickButtonRef, 'Pick', interactionMode === 'pick');
    updateButtonTexture(panButtonRef, 'Pan', interactionMode === 'pan');
  }, [interactionMode]);

  // Update status
  useEffect(() => {
    const solubility = computeSolubility_g_per_100ml(selectedSolute, temperature) * (solventVolumeMl / 100);
    if (dissolvedMass < solubility - 1e-3) {
      setStatus("Unsaturated");
    } else if (Math.abs(dissolvedMass - solubility) < 1e-2) {
      setStatus("Saturated");
      // Mark saturation reached when we have both saturated status AND undissolved mass
      if (undissolvedMass > 0 && currentPart === 'B') {
        setHasReachedSaturation(true);
      }
    } else {
      setStatus("Supersaturated");
    }
  }, [temperature, solventVolumeMl, dissolvedMass, undissolvedMass, selectedSolute, currentPart]);

  // Update floating hints based on current part
  useEffect(() => {
    const hints = {
      'A': '💡 Drag NaCl crystals to the beaker to create an unsaturated solution. Watch the concentration!',
      'B': '💡 Keep adding NaCl crystals until you reach the saturation point. Notice when crystals stop dissolving.',
      'C': '💡 Heat the solution and add more solute, then cool it. Use the seed crystal to trigger precipitation!',
      'D': '💡 Change temperature using the slider and observe how solubility changes with temperature.'
    };
    setFloatingHint(hints[currentPart]);
  }, [currentPart]);

  // Auto-hide floating hints after 8 seconds
  useEffect(() => {
    if (floatingHint) {
      const timer = setTimeout(() => setFloatingHint(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [floatingHint]);

  const handleRecordData = () => {
    // Record data logic
    showNotification('success', 'Data recorded');
    logLevelAction('Data recorded');
  };

  const handleReset = () => {
    setDissolvedMass(0);
    setUndissolvedMass(0);
    setStatus("Unsaturated");
    setTemperature(25);
    setSolventVolumeMl(100);
    setCurrentStep(0);
    setStirCount(0);
    setHasReachedSaturation(false);
    setAddedCrystals(0);
    showNotification('info', '🔄 Reset Complete! Start fresh.');
    logLevelAction('Reset');
    resetPartState();
  };

  // ROBUST EVENT HANDLING
  // We use native listeners on the domElement to ensure we catch events before/with OrbitControls
  // and use refs to avoid stale state closures.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

      // 1. Check for Buttons (Always High Priority)
      const buttonHit = intersects.find(hit => hit.object.userData && hit.object.userData.type === 'button');
      if (buttonHit) {
        buttonHit.object.userData.onClick();
        return; // Stop processing
      }

      // 2. Check for Draggables (Only if in Pick Mode)
      if (interactionModeRef.current === 'pick') {
        const draggableHit = intersects.find(hit =>
          hit.object.userData && (
            hit.object.userData.type === "soluteCrystal" ||
            hit.object.userData.type === "stir" ||
            hit.object.userData.type === "seed" ||
            hit.object.userData.type === "ionToggle"
          )
        );

        if (draggableHit) {
          // Disable controls to prevent camera movement while dragging
          if (controlsRef.current) controlsRef.current.enabled = false;

          isDragging.current = true;
          draggedMeshRef.current = draggableHit.object;

          // Set dragged item state for UI
          const type = draggableHit.object.userData.type;
          const solute = draggableHit.object.userData.solute;
          setDraggedItem(type === 'soluteCrystal' ? solute : type);

          // Lift object
          draggableHit.object.position.y = 2.5;

          // Show placeholder
          if (placeholderRef.current) placeholderRef.current.visible = true;

          showNotification('info', `Dragging ${type === 'soluteCrystal' ? solute : type}`);

          // Capture pointer to ensure we get move/up events even if mouse leaves canvas
          renderer.domElement.setPointerCapture(event.pointerId);
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !draggedMeshRef.current || !cameraRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(dragPlane.current, target);

      // Update object position
      draggedMeshRef.current.position.set(target.x, 2.2 + Math.sin(Date.now() * 0.005) * 0.15, target.z);

      // Update UI card
      if (dragCardRef.current) {
        dragCardRef.current.style.transform = `translate(${event.clientX + 20}px, ${event.clientY + 20}px)`;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      renderer.domElement.releasePointerCapture(event.pointerId);

      // Re-enable controls if we are in pan mode (though we shouldn't be here if we were dragging, but for safety)
      // Actually, if we were dragging, we are in pick mode. 
      // But if user switched mode via keyboard while dragging (edge case), we check ref.
      if (controlsRef.current) {
        controlsRef.current.enabled = interactionModeRef.current === 'pan';
      }

      if (!draggedMeshRef.current) return;

      // Drop Logic
      const pos = draggedMeshRef.current.position;
      const dx = pos.x - beakerPos.x;
      const dz = pos.z - beakerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const isOverBeaker = dist < beakerRadius + 0.6;

      const obj = draggedMeshRef.current;
      const type = obj.userData.type;

      if (isOverBeaker) {
        if (type === 'soluteCrystal') {
          // Inline dissolve logic for solute crystals
          const mass = obj.userData.mass as number;
          const soluteKey = obj.userData.solute as string;
          const solubility_g_per_100ml = computeSolubility_g_per_100ml(soluteKey, temperatureRef.current);
          const maxDissolve_g = solubility_g_per_100ml * (solventVolumeMlRef.current / 100);
          const currentlyDissolved = dissolvedMassRef.current;
          const freeCapacity = Math.max(0, maxDissolve_g - currentlyDissolved);

          if (freeCapacity >= mass) {
            setDissolvedMass(d => d + mass);
            dissolveCrystalIntoIons(obj, soluteKey, mass);
            if (sceneRef.current) sceneRef.current.remove(obj);
            if (soluteCrystalsRef.current) soluteCrystalsRef.current = soluteCrystalsRef.current.filter(m => m !== obj);
            setAvailableCrystals(prev => prev - 1); // Decrement crystal count
            setAddedCrystals(prev => prev + 1); // Increment added crystals count
            showNotification('success', `Dissolved ${mass} g of ${soluteKey}`);
            logLevelAction(`Dissolved ${mass} g of ${soluteKey}`);

            // Show success animation
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 2000);

            // Comprehensive success message
            const molarity = computeMolarity(soluteKey, dissolvedMassRef.current + mass, solventVolumeMlRef.current);
            showNotification('success', `✅ ${mass}g ${soluteKey} dissolved! Molarity: ${molarity.toFixed(3)} M`);
          } else if (freeCapacity > 0) {
            setDissolvedMass(d => d + freeCapacity);
            setUndissolvedMass(u => u + (mass - freeCapacity));
            dissolveCrystalIntoIons(obj, soluteKey, freeCapacity);
            obj.userData.mass = mass - freeCapacity;
            obj.position.set(
              beakerPos.x + (Math.random() - 0.5) * 0.4,
              0.5,
              beakerPos.z + (Math.random() - 0.5) * 0.4
            );
            showNotification('info', `⚠️ Partially dissolved ${freeCapacity.toFixed(2)} g. ${(mass - freeCapacity).toFixed(2)} g undissolved. Approaching saturation!`);
            logLevelAction(`Partially dissolved ${freeCapacity} g of ${soluteKey}`);
          } else {
            setUndissolvedMass(u => u + mass);
            obj.position.set(
              beakerPos.x + (Math.random() - 0.5) * 0.4,
              0.5,
              beakerPos.z + (Math.random() - 0.5) * 0.4
            );
            showNotification('error', '🛑 Solution is SATURATED! No more can dissolve. Try heating or seeding!');
            logLevelAction(`Failed to dissolve ${mass} g of ${soluteKey} - saturated`);
          }
        } else if (type === 'stir') {
          stirAction();
          resetCrystalToTable(obj);
        } else if (type === 'seed') {
          seedAction();
          resetCrystalToTable(obj);
        } else if (type === 'ionToggle') {
          toggleIonsAction();
          resetCrystalToTable(obj);
        }
      } else {
        resetCrystalToTable(obj);
      }

      draggedMeshRef.current = null;
      setDraggedItem(null);
      if (placeholderRef.current) placeholderRef.current.visible = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    return () => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
    };
  }, [rendererRef.current, interactionMode]);

  const dissolvedMassRef = useRef(dissolvedMass);
  const undissolvedMassRef = useRef(undissolvedMass);
  const temperatureRef = useRef(temperature);
  const solventVolumeMlRef = useRef(solventVolumeMl);

  // Sync refs with state
  useEffect(() => { dissolvedMassRef.current = dissolvedMass; }, [dissolvedMass]);
  useEffect(() => { undissolvedMassRef.current = undissolvedMass; }, [undissolvedMass]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { solventVolumeMlRef.current = solventVolumeMl; }, [solventVolumeMl]);

  // Auto-advance to next part when all steps are completed
  useEffect(() => {
    if (currentStep === currentInstructions.length - 1 && currentStepData && currentStepData.check()) {
      // All steps complete, advance part after a delay
      const timer = setTimeout(() => {
        setPartCompleted(true);
        advancePart();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentInstructions.length, currentStepData]);

  // Auto-advance steps when conditions are met
  useEffect(() => {
    if (currentStepData && currentStepData.check()) {
      // Show countdown
      setNextStepCountdown(3);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setNextStepCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Wait 3 seconds to show success, then advance
      const timer = setTimeout(() => {
        if (currentStep < currentInstructions.length - 1) {
          setCurrentStep(s => s + 1);
          showNotification('success', `✅ Step ${currentStep + 1} Complete! Moving to next step...`);
        }
        setNextStepCountdown(null);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
        setNextStepCountdown(null);
      };
    } else {
      setNextStepCountdown(null);
    }
  }, [currentStep, temperature, solventVolumeMl, selectedSolute, dissolvedMass, undissolvedMass, status, currentPart, stirCount, hasReachedSaturation]);

  // Reset steps when part changes
  useEffect(() => {
    setCurrentStep(0);
  }, [currentPart]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-sm">
      <div className="text-center mb-4 p-4 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-5xl font-bold text-purple-300 mb-2">🧪 Unit 2: Solutions & Concentration</h1>
        <p className="text-xl text-purple-200">3D Dissolution/Concentration Simulation</p>
      </div>
      <div className="flex justify-center mb-4 space-x-4">
        <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-xl shadow-md">Score: {score}/100</div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-md">Part: {currentPart}</div>
        <div className="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-md">
          Progress: {currentStep + 1}/{currentInstructions.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-yellow-400 shadow-inner space-y-6">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4 border-b border-yellow-400 pb-2">🔧 Controls</h2>
          <div>
            <label className="block text-white mb-2">Interaction Mode</label>
            <button
              onClick={() => setInteractionMode('pick')}
              className={`mr-2 px-4 py-2 rounded ${interactionMode === 'pick' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
            >
              Pick
            </button>
            <button
              onClick={() => setInteractionMode('pan')}
              className={`px-4 py-2 rounded ${interactionMode === 'pan' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
            >
              Pan
            </button>
          </div>
          <div>
            <label className="block text-white mb-2">Temperature (°C)</label>
            <input
              type="range"
              min={0}
              max={90}
              value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-white">{temperature}</span>
          </div>
          <div>
            <label className="block text-white mb-2">Solvent Volume (mL)</label>
            <input
              type="number"
              value={solventVolumeMl}
              onChange={e => setSolventVolumeMl(Math.max(10, Number(e.target.value) || 10))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Solute</label>
            <select
              value={selectedSolute}
              onChange={e => setSelectedSolute(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              {Object.keys(SOLUTES).map(k => <option key={k} value={k}>{SOLUTES[k].name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <button onClick={handleReset} className="w-full bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-bold text-white">
              Reset
            </button>
            <button
              onClick={replenishCrystals}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all"
            >
              🧂 Replenish NaCl (+12)
            </button>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 bg-gray-700 rounded-xl shadow-2xl overflow-hidden relative">
          {/* Pick/Pan Toggler Buttons */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            <button
              onClick={() => setInteractionMode('pick')}
              className={`px-4 py-2 rounded font-bold text-white ${interactionMode === 'pick' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Pick
            </button>
            <button
              onClick={() => setInteractionMode('pan')}
              className={`px-4 py-2 rounded font-bold text-white ${interactionMode === 'pan' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Pan
            </button>
          </div>
          <div
            ref={mountRef}
            className="w-full h-full"
            style={{ height: '600px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {floatingHint && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-full shadow-2xl animate-bounce z-50 max-w-xl text-center">
              <p className="font-bold text-lg">{floatingHint}</p>
            </div>
          )}

          {/* Floating Step Instructions */}
          {showSteps && currentStepData && (
            <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-2xl border-2 border-purple-500 max-w-md z-40">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-purple-800 text-lg">
                  Part {currentPart} - Step {currentStep + 1}/{currentInstructions.length}
                </h3>
                <button
                  onClick={() => setShowSteps(false)}
                  className="text-gray-500 hover:text-gray-700 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg mb-2">
                <p className="text-gray-800 text-sm font-semibold">{currentStepData.text}</p>
              </div>
              <div className="flex gap-2">
                {currentInstructions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded ${idx < currentStep ? 'bg-green-500' :
                      idx === currentStep ? 'bg-purple-500 animate-pulse' :
                        'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
              {currentStepData.check() && nextStepCountdown !== null && (
                <div className="mt-2 bg-green-100 border-2 border-green-500 rounded-lg p-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="text-green-700 font-bold">Step Complete!</span>
                  </div>
                  <div className="bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg">
                    {nextStepCountdown}s
                  </div>
                </div>
              )}
              {currentStepData.check() && nextStepCountdown === null && (
                <div className="mt-2 text-green-600 font-bold text-sm flex items-center gap-2">
                  ✓ Condition met!
                </div>
              )}
              {currentStep === currentInstructions.length - 1 && currentStepData.check() && (
                <div className="mt-2 text-purple-600 font-bold text-sm animate-pulse">
                  🎉 Part {currentPart} Complete! Auto-advancing in 2 seconds...
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu Button */}
          {!showSteps && (
            <button
              onClick={() => setShowSteps(true)}
              className="absolute top-4 left-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-40"
            >
              📋
            </button>
          )}

          {/* Status Menu (Hamburger) */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
          >
            ☰
          </button>

          {showMenu && (
            <div className="absolute top-16 right-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-2xl border-2 border-blue-500 max-w-xs z-40">
              <h3 className="font-bold text-blue-800 text-lg mb-3">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-bold">{temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-bold">{solventVolumeMl} mL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dissolved:</span>
                  <span className="font-bold">{dissolvedMass.toFixed(2)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Undissolved:</span>
                  <span className="font-bold">{undissolvedMass.toFixed(2)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold ${status === 'Saturated' ? 'text-orange-600' :
                    status === 'Supersaturated' ? 'text-red-600' :
                      'text-green-600'
                    }`}>{status}</span>
                </div>
                {currentPart === 'B' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stir Count:</span>
                    <span className="font-bold text-blue-600">{stirCount} times</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available NaCl:</span>
                  <span className={`font-bold ${availableCrystals < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {availableCrystals} crystals
                  </span>
                </div>
              </div>
            </div>
          )}

          {showSuccessAnimation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <div className="text-9xl animate-ping">✨</div>
            </div>
          )}

          {hoveredObject && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded">
              {hoveredObject === 'soluteCrystal' ? 'Crystal - Drag to beaker' :
                hoveredObject === 'stir' ? 'Stir Paddle - Drag to beaker' :
                  hoveredObject === 'seed' ? 'Seed Crystal - Drag to beaker' :
                    'Ion Toggle - Drag to beaker'}
            </div>
          )}

          {/* Floating Drag Card */}
          <div
            ref={dragCardRef}
            className={`fixed pointer-events-none z-50 bg-white p-3 rounded-lg shadow-2xl border-2 border-purple-500 transform transition-opacity duration-200 ${draggedItem ? 'opacity-100' : 'opacity-0'}`}
            style={{ left: 0, top: 0 }}
          >
            <p className="font-bold text-purple-800 flex items-center gap-2">
              {draggedItem === 'NaCl' ? '🧂 NaCl Crystal' : draggedItem === 'KNO3' ? '🧂 KNO3 Crystal' : draggedItem === 'Sugar' ? '🧂 Sugar Crystal' : draggedItem === 'stir' ? '🌀 Stir Paddle' : draggedItem === 'seed' ? '🌱 Seed Crystal' : draggedItem === 'ionToggle' ? '⚛️ Ion Toggle' : ''}
            </p>
            <p className="text-xs text-gray-600">Release near beaker to use</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 rounded-xl p-6 border-4 border-purple-300 shadow-lg">
        <h3 className="text-xl font-bold text-purple-200 mb-4">Objective</h3>
        <p className="text-white mb-4">
          {currentPart === 'A' ? 'Prepare unsaturated NaCl solution, compute n and M.' :
            currentPart === 'B' ? 'Find saturation point by adding NaCl incrementally.' :
              currentPart === 'C' ? 'Create supersaturated solution and seed for precipitation.' :
                'Test temperature effect on solubility.'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-yellow-300">Temperature</p>
            <p className="text-white text-2xl">{temperature}°C</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-yellow-300">Volume</p>
            <p className="text-white text-2xl">{solventVolumeMl} mL</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-yellow-300">Dissolved</p>
            <p className="text-white text-2xl">{dissolvedMass.toFixed(2)} g</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-yellow-300">Undissolved</p>
            <p className="text-white text-2xl">{undissolvedMass.toFixed(2)} g</p>
          </div>
        </div>
        <p className="text-white mt-4">Status: <strong>{status}</strong></p>
      </div>

      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="text-white font-semibold mb-2">How to Play:</p>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
          <li><strong>📋 Follow Steps:</strong> Check the floating instructions (top-left)</li>
          <li><strong>🎯 Pick Mode:</strong> Drag crystals and tools to the beaker</li>
          <li><strong>🔄 Pan Mode:</strong> Rotate and zoom the camera</li>
          <li><strong>☰ Menu:</strong> View status and progress (top-right)</li>
        </ul>
      </div>

      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="text-white font-semibold mb-2">Status:</p>
        <p className="text-sm text-gray-300">
          {draggedItem ? (
            <span className="font-bold text-yellow-300 text-lg animate-pulse">
              Dragging {draggedItem === 'stir' ? 'Stir Paddle' : draggedItem === 'seed' ? 'Seed Crystal' : draggedItem === 'ionToggle' ? 'Ion Toggle' : draggedItem} crystal
            </span>
          ) : (
            'Ready to drag crystals or tools to the beaker'
          )}
        </p>
      </div>

      <div className="mt-4 text-center text-gray-400 text-xs">
        <p>Phase Change Adventure - Unit 2: Solutions & Concentration</p>
        <p>© 2023 Your Name / Your Institution</p>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PhaseChangeAdventure3D;