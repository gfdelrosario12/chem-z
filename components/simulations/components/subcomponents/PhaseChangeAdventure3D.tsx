import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Scene, Group, Object3DEventMap, Material } from "three";

const PhaseChangeAdventure3D = () => {

    // --- STATE VARIABLES ---
    const [currentLevel, setCurrentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [temperature, setTemperature] = useState(-10);
    const [material, setMaterial] = useState("H₂O");
    const [phase, setPhase] = useState("solid");
    const [isPlateauDetected, setIsPlateauDetected] = useState(false);
    const [message, setMessage] = useState("Use WASD to move. Press Q near tools to pick up. Press E near beaker to use tool.");
    const [statusType, setStatusType] = useState("neutral");
    const [gameState, setGameState] = useState("playing");
    const [heatSourceActive, setHeatSourceActive] = useState(false);
    const [coolingPlateActive, setCoolingPlateActive] = useState(false);
    const [iceSize, setIceSize] = useState(80);
    const [liquidLevel, setLiquidLevel] = useState(0);
    const [experienceTimer, setExperienceTimer] = useState(0);
    const [isExperienceActive, setIsExperienceActive] = useState(false);
    const [timerResetIndicator, setTimerResetIndicator] = useState(false);
    const [processTimeLeft, setProcessTimeLeft] = useState<number | null>(null);
    const [plateauTime, setPlateauTime] = useState(0);

    // Refs for Three.js objects
    const [attempts, setAttempts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
    const [reflection, setReflection] = useState("");
    const [maxScore, setMaxScore] = useState(0);
    const [condensationCount, setCondensationCount] = useState(0);

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState(new THREE.Vector2());
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const isDragging = useRef(false);
    const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

    const mountRef = useRef<HTMLDivElement>(null);
    const dragCardRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = React.useRef<null | THREE.PerspectiveCamera>(null);
    const rendererRef = React.useRef<null | THREE.WebGLRenderer>(null);
    const particlesRef = React.useRef<THREE.Mesh[]>([]);
    const beakerRef = React.useRef<THREE.Mesh | null>(null);
    const iceBlockRef = React.useRef<THREE.Mesh | null>(null);
    const liquidRef = React.useRef<THREE.Mesh | null>(null);
    const placeholderRef = useRef<THREE.Mesh>(null); // Placeholder for drop zone
    const placeholderBurnerRef = useRef<THREE.Mesh>(null);
    const placeholderCoolingRef = useRef<THREE.Mesh>(null);
    const flamesRef = useRef<THREE.Mesh[]>([]);
    const vaporParticlesRef = useRef<THREE.Mesh[]>([]);
    const condensationRef = useRef<THREE.Mesh[]>([]);
    const coolingPlateRef = useRef<Group<Object3DEventMap> | null>(null);
    const burnerRef = React.useRef<THREE.Group | null>(null);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    // Removing playerRef and keysPressed


    // Refs for latest state access in loops
    // Refs for latest state access in loops
    const simulationStateRef = useRef({
        draggedItem,
        heatSourceActive,
        coolingPlateActive,
        phase,
        liquidLevel,
        temperature,
        iceSize,
        currentLevel,
        condensationCount,
        attempts,
        statusType,
        isExperienceActive,
        gameState
    });
    // Refs to hold latest values for keyboard handler - REMOVED

    // Sync refs with state
    useEffect(() => {
        simulationStateRef.current = {
            draggedItem,
            heatSourceActive,
            coolingPlateActive,
            phase,
            liquidLevel,
            temperature,
            iceSize,
            currentLevel,
            condensationCount,
            attempts,
            statusType,
            isExperienceActive,
            gameState
        };
    }, [draggedItem, heatSourceActive, coolingPlateActive, phase, liquidLevel, temperature, iceSize, currentLevel, condensationCount, attempts, statusType, isExperienceActive, gameState]);

    // Tool positions
    const burnerTablePos = { x: -4, z: 3 };
    const coolingTablePos = { x: 4, z: 3 };
    const beakerPos = { x: 0, z: 0 };

    const LEVELS = {
        1: {
            name: "A. Melting (Solid → Liquid)",
            goal: "Pick up the Bunsen Burner and place it near the beaker to heat H₂O from -10°C to 0°C.",
            startTemp: -10,
            points: 3,
            plateau: 0,
            material: "H₂O",
            expectedTime: 25,
            reflectionText: "Why does temperature stay constant during melting? The energy (latent heat) is used to break intermolecular forces rather than increase kinetic energy."
        },
        2: {
            name: "B. Boiling (Liquid → Gas)",
            goal: "Pick up the Bunsen Burner and heat liquid H₂O from 25°C to 100°C to observe boiling.",
            startTemp: 25,
            points: 3,
            plateau: 100,
            material: "H₂O",
            expectedTime: 160,
            reflectionText: "Evaporation is a slow surface phenomenon; boiling is rapid bulk vaporization when vapor pressure equals atmospheric pressure."
        },
        3: {
            name: "C. Condensation (Gas → Liquid)",
            goal: "Pick up the Cooling Plate and place it above the beaker to cool H₂O vapor.",
            startTemp: 110,
            points: 2,
            plateau: 100,
            material: "H₂O",
            expectedTime: 15,
            reflectionText: "Condensation is exothermic: gaseous particles slow and release latent heat as they form liquid."
        },
        4: {
            name: "D. Sublimation (Solid → Gas)",
            goal: "Observe Dry Ice (CO₂) sublimating directly from Solid → Gas. No heating needed!",
            startTemp: -78.5,
            points: 2,
            plateau: -78.5,
            material: "CO₂",
            expectedTime: 80,
            reflectionText: "Dry Ice sublimates at 1 atm because liquid CO₂ cannot exist at normal atmospheric pressure."
        }
    };

    const MAX_ATTEMPTS = 3;
    const AMBIENT_TEMP = 25;

    // Mouse Event Handlers for Drag and Drop
    const handleMouseDown = (event: React.MouseEvent) => {
        if (gameState !== 'playing' || !mountRef.current || !cameraRef.current || !sceneRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, cameraRef.current);

        const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            // Check if clicked on burner or cooling plate (or their children)
            let parent = object.parent;
            while (parent) {
                if (parent === burnerRef.current) {
                    setDraggedItem('burner');
                    isDragging.current = true;
                    if (placeholderBurnerRef.current) placeholderBurnerRef.current.visible = true;
                    return;
                }
                if (parent === coolingPlateRef.current) {
                    setDraggedItem('cooling');
                    isDragging.current = true;
                    if (placeholderCoolingRef.current) placeholderCoolingRef.current.visible = true;
                    return;
                }
                parent = parent.parent;
            }
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!isDragging.current || !draggedItem || !mountRef.current || !cameraRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, cameraRef.current);

        const target = new THREE.Vector3();
        raycaster.current.ray.intersectPlane(dragPlane.current, target);

        // Update position visually immediately for smoothness
        if (draggedItem === 'burner' && burnerRef.current) {
            burnerRef.current.position.set(target.x, 1.5, target.z); // Float at y=1.5
        } else if (draggedItem === 'cooling' && coolingPlateRef.current) {
            coolingPlateRef.current.position.set(target.x, 4.5, target.z); // Float at y=4.5 (above beaker)
        }

        // Update floating card position
        if (dragCardRef.current) {
            dragCardRef.current.style.transform = `translate(${event.clientX + 20}px, ${event.clientY + 20}px)`;
        }
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (placeholderBurnerRef.current) placeholderBurnerRef.current.visible = false;
        if (placeholderCoolingRef.current) placeholderCoolingRef.current.visible = false;

        // Check drop logic
        let itemPos = new THREE.Vector3();
        if (draggedItem === 'burner' && burnerRef.current) {
            itemPos.copy(burnerRef.current.position);
        } else if (draggedItem === 'cooling' && coolingPlateRef.current) {
            itemPos.copy(coolingPlateRef.current.position);
        }

        const distToBeaker = Math.sqrt((itemPos.x - beakerPos.x) ** 2 + (itemPos.z - beakerPos.z) ** 2);

        // For cooling plate, check if it's above the beaker (Y > 3.5)
        // For burner, check if it's near the beaker on the ground (Y < 2)
        let isValidDrop = false;
        if (draggedItem === 'cooling') {
            // Cooling plate must be above beaker
            isValidDrop = distToBeaker < 2.5 && itemPos.y > 3.5;
        } else if (draggedItem === 'burner') {
            // Burner must be below/near beaker on ground level
            isValidDrop = distToBeaker < 2 && itemPos.y < 2;
        }

        if (isValidDrop) {
            // Snap to active
            if (draggedItem === 'burner') {
                setHeatSourceActive(true);
                setCoolingPlateActive(false); // Mutually exclusive usually
                setMessage("Action Started: Heating... Monitor the temperature!");
                setStatusType("success");
            } else if (draggedItem === 'cooling') {
                setCoolingPlateActive(true);
                setHeatSourceActive(false);
                setMessage("Action Started: Cooling... Monitor the temperature!");
                setStatusType("success");
            }
        } else {
            // Reset to table
            if (draggedItem === 'burner') {
                setHeatSourceActive(false);
            } else if (draggedItem === 'cooling') {
                setCoolingPlateActive(false);
            }
            setMessage("Action Cancelled. Tool returned to table.");
            setStatusType("warning");
        }
        setDraggedItem(null);
    };

    // Initialize Three.js scene
    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 12, 12);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        scene.add(directionalLight);

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

        // Create beaker
        const beakerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32, 1, true);
        const beakerMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5
        });
        const beaker = new THREE.Mesh(beakerGeometry, beakerMaterial);
        beaker.position.set(beakerPos.x, 2, beakerPos.z);
        beaker.castShadow = true;
        scene.add(beaker);
        beakerRef.current = beaker;

        const rimGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(beakerPos.x, 4, beakerPos.z);
        rim.rotation.x = Math.PI / 2;
        scene.add(rim);

        // Liquid
        const liquidGeometry = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32);
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.7,
            metalness: 0.2,
            roughness: 0.3
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.set(beakerPos.x, 0.05, beakerPos.z);
        liquid.visible = false;
        scene.add(liquid);
        liquidRef.current = liquid;

        // Ice block
        const iceGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const iceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xadd8e6,
            transparent: true,
            opacity: 0.8,
            metalness: 0.1,
            roughness: 0.2,
            transmission: 0.5
        });
        const ice = new THREE.Mesh(iceGeometry, iceMaterial);
        ice.position.set(beakerPos.x, 1.5, beakerPos.z);
        ice.castShadow = true;
        scene.add(ice);
        iceBlockRef.current = ice;

        // Placeholder Guide for Burner (below beaker)
        const placeholderBurnerGeo = new THREE.BoxGeometry(2, 0.1, 2);
        const placeholderBurnerMat = new THREE.MeshBasicMaterial({
            color: 0xff6600, // Orange for burner
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const placeholderBurner = new THREE.Mesh(placeholderBurnerGeo, placeholderBurnerMat);
        placeholderBurner.position.set(beakerPos.x, 0.1, beakerPos.z);
        placeholderBurner.visible = false;
        scene.add(placeholderBurner);
        placeholderBurnerRef.current = placeholderBurner;

        // Placeholder Guide for Cooling Plate (above beaker)
        const placeholderCoolingGeo = new THREE.BoxGeometry(2, 0.1, 2);
        const placeholderCoolingMat = new THREE.MeshBasicMaterial({
            color: 0x00ccff, // Blue for cooling
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const placeholderCooling = new THREE.Mesh(placeholderCoolingGeo, placeholderCoolingMat);
        placeholderCooling.position.set(beakerPos.x, 4.5, beakerPos.z); // Above the beaker
        placeholderCooling.visible = false;
        scene.add(placeholderCooling);
        placeholderCoolingRef.current = placeholderCooling;

        // Particles
        const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const solidMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });

        for (let i = 0; i < 100; i++) {
            const particle = new THREE.Mesh(particleGeometry, solidMaterial.clone());
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.6;
            particle.position.set(
                beakerPos.x + Math.cos(angle) * radius,
                1.5 + (Math.random() - 0.5) * 0.8,
                beakerPos.z + Math.sin(angle) * radius
            );
            particle.userData = {
                originalPos: particle.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                )
            };
            scene.add(particle);
            particle.userData.current = [];
            particle.userData.current.push(particle);
        }

        // Burner table and burner
        const tableGeometry = new THREE.BoxGeometry(2, 0.8, 2);
        const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const burnerTable = new THREE.Mesh(tableGeometry, tableMaterial);
        burnerTable.position.set(burnerTablePos.x, 0.4, burnerTablePos.z);
        burnerTable.castShadow = true;
        burnerTable.receiveShadow = true;
        scene.add(burnerTable);

        const burnerGroup = new THREE.Group();
        const burnerBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 1, 16),
            new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        burnerBody.position.y = 0.5;
        burnerBody.castShadow = true;
        burnerGroup.add(burnerBody);
        burnerGroup.position.set(burnerTablePos.x, 0.8, burnerTablePos.z);
        scene.add(burnerGroup);
        burnerRef.current = burnerGroup;

        // Cooling table and plate
        const coolingTable = new THREE.Mesh(tableGeometry, tableMaterial);
        coolingTable.position.set(coolingTablePos.x, 0.4, coolingTablePos.z);
        coolingTable.castShadow = true;
        coolingTable.receiveShadow = true;
        scene.add(coolingTable);

        const coolingGroup = new THREE.Group();
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x4169e1, metalness: 0.5 })
        );
        plate.castShadow = true;
        coolingGroup.add(plate);
        coolingGroup.position.set(coolingTablePos.x, 0.9, coolingTablePos.z);
        scene.add(coolingGroup);
        coolingPlateRef.current = coolingGroup;

        // Player (scientist character) - REMOVED
        // const playerGroup = new THREE.Group(); ...

        setMaxScore(Object.values(LEVELS).reduce((sum, level) => sum + level.points, 0));

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update player position - REMOVED
            // if (playerRef.current) { ... }

            const {
                draggedItem,
                heatSourceActive,
                coolingPlateActive,
                phase,
                liquidLevel,
                temperature
            } = simulationStateRef.current;

            // Update tool positions when held (dragged)
            // Note: Visual updates for dragging are handled in onMouseMove for smoothness, 
            // but we ensure they stay in place if active or reset if not.

            // If not dragging, ensure they are at their correct positions (active or table)
            if (burnerRef.current && draggedItem !== 'burner') {
                if (heatSourceActive) {
                    burnerRef.current.position.set(beakerPos.x, -0.5, beakerPos.z);
                } else {
                    burnerRef.current.position.set(burnerTablePos.x, 0.8, burnerTablePos.z);
                }
            }

            if (coolingPlateRef.current && draggedItem !== 'cooling') {
                if (coolingPlateActive) {
                    coolingPlateRef.current.position.set(beakerPos.x, 5, beakerPos.z);
                } else {
                    coolingPlateRef.current.position.set(coolingTablePos.x, 0.9, coolingTablePos.z);
                }
            }

            // Update particles
            particlesRef.current.forEach((particle) => {
                if (phase === "solid") {
                    const vibration = 0.02 * (1 + temperature / 50);
                    particle.position.x = particle.userData.originalPos.x + (Math.random() - 0.5) * vibration;
                    particle.position.y = particle.userData.originalPos.y + (Math.random() - 0.5) * vibration;
                    particle.position.z = particle.userData.originalPos.z + (Math.random() - 0.5) * vibration;
                } else if (phase === "liquid") {
                    particle.position.add(particle.userData.velocity);

                    const dx = particle.position.x - beakerPos.x;
                    const dz = particle.position.z - beakerPos.z;
                    const dist = Math.sqrt(dx ** 2 + dz ** 2);
                    const radius = 1.3;

                    if (dist > radius) {
                        const angle = Math.atan2(dz, dx);
                        particle.position.x = beakerPos.x + Math.cos(angle) * radius;
                        particle.position.z = beakerPos.z + Math.sin(angle) * radius;
                        particle.userData.velocity.x *= -0.8;
                        particle.userData.velocity.z *= -0.8;
                    }

                    if (particle.position.y < 0.5 || particle.position.y > 0.5 + liquidLevel * 0.03) {
                        particle.userData.velocity.y *= -0.8;
                        particle.position.y = Math.max(0.5, Math.min(0.5 + liquidLevel * 0.03, particle.position.y));
                    }
                } else if (phase === "gas") {
                    particle.userData.velocity.y = 0.05;
                    particle.position.add(particle.userData.velocity);

                    if (particle.position.y > 6) {
                        particle.position.set(
                            beakerPos.x + (Math.random() - 0.5) * 0.5,
                            0.5,
                            beakerPos.z + (Math.random() - 0.5) * 0.5
                        );
                    }
                }
            });

            // Update vapor
            vaporParticlesRef.current.forEach((vapor: THREE.Object3D, index: number) => {
                vapor.position.y += 0.03;
                vapor.position.x += (Math.random() - 0.5) * 0.02;
                vapor.position.z += (Math.random() - 0.5) * 0.02;
                vapor.scale.multiplyScalar(1.01);
                if (vapor instanceof THREE.Mesh && vapor.material instanceof THREE.MeshBasicMaterial) {
                    (vapor.material as THREE.MeshBasicMaterial).opacity *= 0.98;
                    if (vapor.position.y > 8 || (vapor.material as THREE.MeshBasicMaterial).opacity < 0.1) {
                        scene.remove(vapor);
                        vaporParticlesRef.current.splice(index, 1);
                    }
                }
            });

            // Update condensation
            condensationRef.current.forEach((drop, index) => {
                drop.position.y -= 0.05;

                if (drop.position.y < 0.5) {
                    scene.remove(drop);
                    condensationRef.current.splice(index, 1);
                }
            });

            // Update flames
            if (heatSourceActive && burnerRef.current) {
                if (flamesRef.current.length < 20) {
                    const flame = new THREE.Mesh(
                        new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 8),
                        new THREE.MeshBasicMaterial({
                            color: Math.random() > 0.5 ? 0xff6600 : 0xffaa00,
                            transparent: true,
                            opacity: 0.6
                        })
                    );
                    flame.position.set(
                        burnerRef.current.position.x + (Math.random() - 0.5) * 0.3,
                        burnerRef.current.position.y + 1 + Math.random() * 0.5,
                        burnerRef.current.position.z + (Math.random() - 0.5) * 0.3
                    );
                    scene.add(flame);
                    flamesRef.current.push(flame);
                }

                flamesRef.current.forEach((flame, index) => {
                    flame.position.y += 0.05;
                    flame.scale.multiplyScalar(0.95);
                    if (flame.material instanceof THREE.MeshBasicMaterial && burnerRef.current) {
                        flame.material.opacity *= 0.95;
                        if (flame.position.y > burnerRef.current.position.y + 2 || flame.material.opacity < 0.1) {
                            scene.remove(flame);
                            flamesRef.current.splice(index, 1);
                        }
                    }
                });
            }

            // Animate placeholder pulse for both burner and cooling
            const time = Date.now() * 0.005;
            if (placeholderBurnerRef.current && placeholderBurnerRef.current.visible) {
                (placeholderBurnerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time) * 0.2;
            }
            if (placeholderCoolingRef.current && placeholderCoolingRef.current.visible) {
                (placeholderCoolingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time) * 0.2;
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    // Update 3D scene based on state
    useEffect(() => {
        if (!sceneRef.current) return;

        if (iceBlockRef.current) {
            const scale = iceSize / 80;
            iceBlockRef.current.scale.set(scale, scale, scale);
            iceBlockRef.current.visible = iceSize > 0 && (phase === "solid" || currentLevel === 1);

            if (material === "CO₂") {
                (iceBlockRef.current.material as THREE.MeshPhysicalMaterial).color.setHex(0xf0f0f0);
            } else {
                (iceBlockRef.current.material as THREE.MeshPhysicalMaterial).color.setHex(0xadd8e6);
            }
        }

        if (liquidRef.current) {
            const height = liquidLevel * 0.03;
            liquidRef.current.scale.y = Math.max(0.1, height);
            liquidRef.current.position.y = 0.5 + height / 2;
            liquidRef.current.visible = liquidLevel > 0 && phase === "liquid";
        }

        particlesRef.current.forEach(particle => {
            // Ensure material is a MeshStandardMaterial before accessing color and opacity
            if (Array.isArray(particle.material)) {
                // Handle array of materials if necessary, though typically not for particles
                // For simplicity, we'll assume a single material for particles
                return;
            }
            if (particle.material instanceof THREE.MeshStandardMaterial) {
                if (phase === "solid") {
                    particle.material.color.setHex(0x87ceeb);
                    particle.material.opacity = 0.9;
                } else if (phase === "liquid") {
                    particle.material.color.setHex(0x4a90e2);
                    particle.material.opacity = 0.8;
                } else { // gas
                    particle.material.color.setHex(0xccddff);
                    particle.material.opacity = 0.4;
                }
            }
        });
    }, [iceSize, liquidLevel, phase, material, currentLevel]);

    // Visual feedback for dragging
    useEffect(() => {
        if (burnerRef.current) {
            const scale = draggedItem === 'burner' ? 1.2 : 1;
            burnerRef.current.scale.set(scale, scale, scale);
            // Optional: Add emissive glow if materials allowed, but scale is safer for now
        }
        if (coolingPlateRef.current) {
            const scale = draggedItem === 'cooling' ? 1.2 : 1;
            coolingPlateRef.current.scale.set(scale, scale, scale);
        }

        // Show/Hide placeholders
        if (placeholderBurnerRef.current) {
            placeholderBurnerRef.current.visible = draggedItem === 'burner';
        }
        if (placeholderCoolingRef.current) {
            placeholderCoolingRef.current.visible = draggedItem === 'cooling';
        }
    }, [draggedItem]);

    // Game logic loop
    useEffect(() => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);

        gameLoopRef.current = setInterval(() => {
            if (gameState !== "playing") return;

            if (isExperienceActive) {
                setExperienceTimer(t => t + 0.25);
            }

            if (!heatSourceActive && !coolingPlateActive && isExperienceActive) {
                setIsExperienceActive(false);
                setMessage("Experience paused. Use WASD to move, Q to pick up tools, E to use them.");
            }

            let tempChange = 0;
            const heatRate = 0.5;
            const coolRate = -0.5;
            const ambientRate = 0.1;

            if (heatSourceActive) {
                tempChange = heatRate;
            } else if (coolingPlateActive) {
                tempChange = coolRate;
            } else {
                if (Math.abs(temperature - AMBIENT_TEMP) > 0.5) {
                    tempChange = temperature < AMBIENT_TEMP ? ambientRate : -ambientRate;
                }
            }

            let newTemp = temperature + tempChange;
            let isonPlateau = false;

            // Centralized Timer Logic
            // We calculate the TOTAL estimated time remaining until success
            let totalTimeLeft = null;

            if (heatSourceActive) {
                if (currentLevel === 1) { // Melting
                    const timeToReach0 = newTemp < 0 ? Math.abs(0 - newTemp) / 2 : 0;
                    const timeToMelt = iceSize / 4;
                    totalTimeLeft = Math.ceil(timeToReach0 + timeToMelt);
                } else if (currentLevel === 2) { // Boiling
                    const timeToReach100 = newTemp < 100 ? Math.abs(100 - newTemp) / 2 : 0;
                    const timeToBoil = liquidLevel / 2;
                    totalTimeLeft = Math.ceil(timeToReach100 + timeToBoil);
                }
            } else if (coolingPlateActive) {
                if (currentLevel === 3) { // Condensing
                    const timeToReach100 = newTemp > 100 ? Math.abs(newTemp - 100) / 2 : 0;
                    const timeToCondense = (30 - condensationCount) / 2.8;
                    totalTimeLeft = Math.ceil(timeToReach100 + timeToCondense);
                } else if (currentLevel === 4) { // Sublimation (Cooling) - hypothetical level logic
                    // Assuming sublimation might use cooling in some context or just heating, 
                    // but based on previous logic it was heating. 
                    // If level 4 is heating (sublimation usually is solid -> gas), 
                    // checking previous logic: it was using heatSourceActive.
                    // So this block is for cooling.
                }
            }

            // Re-check Level 4 if it uses heat
            if (heatSourceActive && currentLevel === 4) {
                const timeToSublime = iceSize / 2;
                totalTimeLeft = Math.ceil(timeToSublime);
            }

            // Store this in a ref or state if needed, but for now we can just use it for the UI
            // Since we removed processTimeLeft state, we'll re-add a unified state for UI
            setProcessTimeLeft(totalTimeLeft);

            const handleIncorrectAction = (warningMessage: string) => {
                setStatusType("warning");
                setMessage(warningMessage);
                const newAttempts = attempts[currentLevel as keyof typeof attempts] + 1;
                setAttempts(a => ({ ...a, [currentLevel]: newAttempts }));
                setGameState("paused");

                if (newAttempts >= MAX_ATTEMPTS) {
                    setTimeout(() => failLevel(), 2000);
                } else {
                    setMessage(`${warningMessage} Attempts: ${newAttempts}/${MAX_ATTEMPTS}. Resetting level.`);
                    setTimeout(() => setupLevel(currentLevel), 2000);
                }
            };

            switch (currentLevel) {
                case 1:
                    if (newTemp >= 0 && iceSize > 0 && heatSourceActive) {
                        isonPlateau = true;
                        newTemp = 0;
                        setIceSize(s => Math.max(0, s - 1));
                        if (iceSize <= 1) {
                            setPhase("liquid");
                            setLiquidLevel(100);
                        }
                    }

                    if (iceSize <= 0 && temperature > 1) {
                        completeLevel(LEVELS[1].points);
                    } else if (temperature > 5 && heatSourceActive && iceSize > 0) {
                        handleIncorrectAction("Too fast! You missed the melting plateau!");
                    }
                    break;

                case 2:
                    if (newTemp >= 100 && liquidLevel > 0 && heatSourceActive) {
                        isonPlateau = true;
                        newTemp = 100;
                        setLiquidLevel(l => Math.max(0, l - 0.5));

                        if (Math.random() > 0.5 && sceneRef.current) {
                            const vapor = new THREE.Mesh(
                                new THREE.SphereGeometry(0.15, 8, 8),
                                new THREE.MeshBasicMaterial({
                                    color: 0xe0e0e0,
                                    transparent: true,
                                    opacity: 0.5
                                })
                            );
                            vapor.position.set(
                                beakerPos.x + (Math.random() - 0.5) * 1,
                                2.5,
                                beakerPos.z + (Math.random() - 0.5) * 1
                            );
                            sceneRef.current.add(vapor);
                            vaporParticlesRef.current.push(vapor);
                        }
                    }

                    if (liquidLevel <= 0) {
                        setPhase("gas");
                        completeLevel(LEVELS[2].points);
                    } else if (temperature > 105 && heatSourceActive) {
                        handleIncorrectAction("Too fast! You missed the boiling plateau!");
                    }
                    break;

                case 3:
                    setPhase("gas");
                    if (newTemp <= 100 && coolingPlateActive) {
                        isonPlateau = true;
                        newTemp = 100;

                        if (Math.random() > 0.3 && sceneRef.current) {
                            const drop = new THREE.Mesh(
                                new THREE.SphereGeometry(0.05, 8, 8),
                                new THREE.MeshStandardMaterial({ color: 0x4a90e2 })
                            );
                            drop.position.set(
                                beakerPos.x + (Math.random() - 0.5) * 2,
                                5.5,
                                beakerPos.z + (Math.random() - 0.5) * 1.5
                            );
                            sceneRef.current.add(drop);
                            condensationRef.current.push(drop);
                            setCondensationCount(c => c + 1);
                        }
                    }

                    if (condensationCount > 30) {
                        completeLevel(LEVELS[3].points);
                    } else if (heatSourceActive) {
                        handleIncorrectAction("Wrong! You must cool vapor, not heat it!");
                    }
                    break;

                case 4:
                    if (iceSize > 0 && !coolingPlateActive) {
                        isonPlateau = true;
                        newTemp = -78.5;
                        setIceSize(s => Math.max(0, s - 0.5));
                        setPhase("gas");

                        if (Math.random() > 0.4 && sceneRef.current) {
                            const vapor = new THREE.Mesh(
                                new THREE.SphereGeometry(0.15, 8, 8),
                                new THREE.MeshBasicMaterial({
                                    color: 0xcccccc,
                                    transparent: true,
                                    opacity: 0.4
                                })
                            );
                            vapor.position.set(
                                beakerPos.x + (Math.random() - 0.5) * 0.8,
                                1.5,
                                beakerPos.z + (Math.random() - 0.5) * 0.8
                            );
                            sceneRef.current.add(vapor);
                            vaporParticlesRef.current.push(vapor);
                        }
                    }

                    if (iceSize <= 0) {
                        completeLevel(LEVELS[4].points);
                    } else if (heatSourceActive) {
                        handleIncorrectAction("Wrong! Dry ice sublimates on its own!");
                    }
                    break;
            }

            setIsPlateauDetected(isonPlateau);
            if (isonPlateau) {
                setPlateauTime(t => t + 0.25);
                if (statusType !== "success") {
                    setStatusType("success");
                    setMessage("✓ Correct! Plateau detected. Maintain this action.");
                }
            } else {
                setPlateauTime(0);
                if (!heatSourceActive && !coolingPlateActive && statusType !== "neutral") {
                    setMessage(LEVELS[currentLevel as keyof typeof LEVELS].goal);
                    setStatusType("neutral");
                }
            }

            setTemperature(newTemp);
        }, 250);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState, heatSourceActive, coolingPlateActive, temperature, iceSize, liquidLevel, currentLevel, condensationCount, attempts, statusType, isExperienceActive]);

    const setupLevel = (levelNumber: number) => {
        if (levelNumber > Object.keys(LEVELS).length) {
            setGameState("finished");
            setMessage(`Congratulations! Final Score: ${score}/${maxScore}`);
            return;
        }

        const level = LEVELS[levelNumber as keyof typeof LEVELS];
        setCurrentLevel(levelNumber);
        setTemperature(level.startTemp);
        setMaterial(level.material);
        setMessage(level.goal);
        setGameState("playing");
        setStatusType("neutral");
        setPlateauTime(0);
        setIsPlateauDetected(false);
        setHeatSourceActive(false);
        setCoolingPlateActive(false);
        setCondensationCount(0);
        setReflection(level.reflectionText);
        setExperienceTimer(0);
        setIsExperienceActive(false);
        setTimerResetIndicator(false);
        setTimerResetIndicator(false);
        setDraggedItem(null);

        if (levelNumber === 1) {
            setPhase("solid");
            setIceSize(80);
            setLiquidLevel(0);
        } else if (levelNumber === 2) {
            setPhase("liquid");
            setIceSize(0);
            setLiquidLevel(100);
        } else if (levelNumber === 3) {
            setPhase("gas");
            setIceSize(0);
            setLiquidLevel(0);
        } else if (levelNumber === 4) {
            setPhase("solid");
            setIceSize(80);
            setLiquidLevel(0);
        }

        vaporParticlesRef.current.forEach(v => sceneRef.current?.remove(v));
        vaporParticlesRef.current = [];
        condensationRef.current.forEach(d => sceneRef.current?.remove(d));
        condensationRef.current = [];
        flamesRef.current.forEach(f => sceneRef.current?.remove(f));
        flamesRef.current = [];
    };

    const completeLevel = (points: number) => {
        if (gameState !== "playing") return;
        setGameState("reflection");
        setScore(s => s + points);
        setMessage(`Level ${currentLevel} complete! You earned ${points} points.`);
        setStatusType("success");
        setIsExperienceActive(false);
    };

    const failLevel = () => {
        setGameState("failed");
        setMessage(`Attempt limit reached for Level ${currentLevel}.`);
        setStatusType("warning");
    };

    const handleNextLevel = () => {
        if (gameState === "failed") {
            setAttempts(a => ({ ...a, [currentLevel]: 0 }));
        }
        if (currentLevel < Object.keys(LEVELS).length) {
            setupLevel(currentLevel + 1);
        } else {
            setGameState("finished");
            setMessage(`Congratulations! Final Score: ${score}/${maxScore}`);
        }
    };

    const handleResetGame = () => {
        setScore(0);
        setAttempts({ 1: 0, 2: 0, 3: 0, 4: 0 });
        setExperienceTimer(0);
        setIsExperienceActive(false);
        setDraggedItem(null);
        setupLevel(1);
    };

    const handleCloseSimulation = () => {
        if (window.opener) {
            window.opener.postMessage("LAB_DONE", "*");
        }
        window.close();
    };

    const handleResetControls = () => {
        setHeatSourceActive(false);
        setCoolingPlateActive(false);
        setDraggedItem(null);
        setMessage("Tools reset. Drag tools to the beaker to use them.");
        setStatusType("neutral");
        setExperienceTimer(0);
        setIsExperienceActive(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 4px solid #8b5cf6;
          max-width: 500px;
          width: 90%;
          text-align: center;
          color: #333;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .modal-content h2 {
          font-size: 2rem;
          font-weight: bold;
          color: #6d28d9;
          margin-bottom: 1rem;
        }
        .modal-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          color: #333;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          border-bottom: 2px solid #ddd;
          padding-bottom: 0.5rem;
        }
        .modal-content p {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .modal-button {
          background-color: #8b5cf6;
          color: white;
          font-weight: bold;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background-color 0.2s;
        }
        .modal-button:hover {
          background-color: #7c3aed;
        }
      `}</style>

            {(gameState === 'reflection' || gameState === 'finished' || gameState === 'failed') && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {gameState === 'reflection' ? (
                            <>
                                <h2>Level {currentLevel} Complete!</h2>
                                <p>You earned <strong>{LEVELS[currentLevel as keyof typeof LEVELS].points} points.</strong></p>
                                <h3>Reflection:</h3>
                                <p>{reflection}</p>
                                <button className="modal-button" onClick={handleNextLevel}>
                                    {currentLevel < Object.keys(LEVELS).length ? 'Next Level' : 'Finish Game'}
                                </button>
                            </>
                        ) : gameState === 'finished' ? (
                            <>
                                <h2>Congratulations!</h2>
                                <p>You have completed all simulations!</p>
                                <p>Your final score is: <strong>{score} / {maxScore}</strong></p>
                                <button className="modal-button" onClick={handleCloseSimulation}>
                                    Close Simulation
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>Level Failed</h2>
                                <p>You have reached the maximum number of attempts for this level.</p>
                                <h3>Concept Review:</h3>
                                <p>{reflection}</p>
                                <button className="modal-button" onClick={handleNextLevel}>
                                    Continue to Next Level
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Drag Card */}
            <div
                ref={dragCardRef}
                className={`fixed pointer-events-none z-50 bg-white p-3 rounded-lg shadow-2xl border-2 border-purple-500 transform transition-opacity duration-200 ${draggedItem ? 'opacity-100' : 'opacity-0'}`}
                style={{ left: 0, top: 0 }}
            >
                <p className="font-bold text-purple-800 flex items-center gap-2">
                    {draggedItem === 'burner' ? '🔥 Bunsen Burner' : '🧊 Cooling Plate'}
                </p>
                <p className="text-xs text-gray-600">Release near beaker to use</p>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-4 p-4 bg-gray-800 rounded-xl shadow-lg">
                    <h1 className="text-5xl font-bold text-purple-300 mb-2">🧪 Matter in Our Surroundings</h1>
                    <p className="text-xl text-purple-200">Can Matter Change Its State? (Effect of Change of Temperature)</p>
                </div>

                <div className="flex justify-center mb-4 space-x-4 flex-wrap gap-2">
                    <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-xl shadow-md">
                        Score: {score}/{maxScore}
                    </div>
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-md">
                        Level: {currentLevel} ({LEVELS[currentLevel as keyof typeof LEVELS].name})
                    </div>
                    <div className={`px-6 py-3 rounded-full font-bold text-xl shadow-md transition-all duration-500 ${timerResetIndicator
                        ? 'bg-green-500 text-white animate-pulse ring-4 ring-green-300'
                        : isExperienceActive
                            ? (LEVELS[currentLevel as keyof typeof LEVELS].expectedTime - experienceTimer < 10
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-blue-600 text-white')
                            : 'bg-gray-700 text-white'
                        }`}>
                        {isExperienceActive
                            ? `Time Left: ${Math.max(0, Math.ceil(LEVELS[currentLevel as keyof typeof LEVELS].expectedTime - experienceTimer))}s`
                            : 'Ready to Start'
                        }                      {timerResetIndicator && <span className="ml-2">🔄</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 border-2 border-yellow-400 shadow-inner space-y-4">
                        <h2 className="text-2xl font-bold text-yellow-300 mb-4 border-b border-yellow-400 pb-2">
                            🎮 Controls
                        </h2>

                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-white font-semibold mb-2">How to Play:</p>
                            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                <li><strong>Drag</strong> the Bunsen Burner to the beaker to heat.</li>
                                <li><strong>Drag</strong> the Cooling Plate above the beaker to cool.</li>
                                <li>Release away from beaker to return tool to table.</li>
                            </ul>
                        </div>

                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-white font-semibold mb-2">Status:</p>
                            <p className="text-sm text-gray-300">
                                {draggedItem ? (
                                    <span className="font-bold text-yellow-300 text-lg animate-pulse">
                                        DRAGGING: {draggedItem === 'burner' ? '🔥 BUNSEN BURNER' : '🧊 COOLING PLATE'}
                                    </span>
                                ) : 'Ready - Drag a tool to start'}
                            </p>
                        </div>

                        <button
                            onClick={handleResetControls}
                            className="w-full bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-bold text-white text-center shadow-lg transform hover:scale-105 transition-transform"
                        >
                            Reset Tools
                        </button>



                        <button
                            onClick={handleResetGame}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold text-white text-center shadow-lg transform hover:scale-105 transition-transform"
                        >
                            Reset Game
                        </button>
                    </div>

                    <div className="col-span-1 lg:col-span-4 bg-black rounded-xl shadow-2xl overflow-hidden" style={{ height: '600px' }}>
                        <div
                            ref={mountRef}
                            style={{ width: '100%', height: '100%', cursor: draggedItem ? 'grabbing' : 'grab' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                    </div>
                </div>

                <div className={`mt-4 bg-gray-800 rounded-xl p-4 border-4 ${statusType === 'success' ? 'border-green-500' :
                    statusType === 'warning' ? 'border-red-500' :
                        'border-purple-300'
                    } shadow-lg transition-colors duration-300`}>
                    <h3 className="text-xl font-bold text-purple-200 mb-2">Current Objective:</h3> {/* @ts-ignore */}
                    <p className="text-lg text-white mb-2">{LEVELS[currentLevel as keyof typeof LEVELS].goal}</p>

                    <h3 className={`text-xl font-bold mb-2 ${statusType === 'success' ? 'text-green-400' :
                        statusType === 'warning' ? 'text-red-400' :
                            'text-yellow-300'
                        }`}>Status:</h3>
                    <p className={`text-lg ${statusType === 'success' ? 'text-green-300' :
                        statusType === 'warning' ? 'text-red-300' :
                            'text-yellow-100'
                        } font-bold`}>{message}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-700 p-2 rounded">
                            <span className="text-gray-400">Temperature:</span>
                            <span className="text-white font-bold ml-2">{temperature.toFixed(1)}°C</span>
                            {processTimeLeft !== null && processTimeLeft > 0 && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full animate-pulse bg-green-600 text-white">
                                    Success in ~{processTimeLeft}s
                                </span>
                            )}
                        </div>
                        <div className="bg-gray-700 p-2 rounded">
                            <span className="text-gray-400">Phase:</span>
                            <span className="text-white font-bold ml-2">{phase.toUpperCase()}</span>
                        </div>
                        <div className="bg-gray-700 p-2 rounded">
                            <span className="text-gray-400">Material:</span>
                            <span className="text-white font-bold ml-2">{material}</span>
                        </div>
                        <div className="bg-gray-700 p-2 rounded">
                            <span className="text-gray-400">Plateau:</span>
                            <span className={`font-bold ml-2 ${isPlateauDetected ? 'text-green-400' : 'text-gray-400'}`}>
                                {isPlateauDetected ? '✓ DETECTED' : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseChangeAdventure3D;