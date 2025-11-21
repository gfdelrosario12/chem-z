# Custom Camera Control System Implementation

## Overview
Implemented a custom camera control system using **spherical coordinates** to replace OrbitControls. This provides smooth, manual camera panning that works seamlessly alongside the pick mode for asset dragging.

## Why Custom Controls?

The original OrbitControls approach had a fundamental issue: **event handler conflicts**. The mouse event handlers needed for pick mode were preventing OrbitControls from receiving mouse events, even when enabled. 

Rather than trying to work around this limitation, I implemented a **custom camera control system** that gives us full control over both modes.

---

## Technical Implementation

### 1. **Spherical Coordinate System**

The camera position is calculated using spherical coordinates:
- **θ (theta)**: Horizontal rotation angle around the target
- **φ (phi)**: Vertical angle from the top
- **radius**: Distance from the target point

```typescript
// Custom camera control state
const isPanning = useRef(false);
const previousMousePosition = useRef({ x: 0, y: 0 });
const cameraRotation = useRef({ theta: 0, phi: Math.PI / 4 }); // spherical coordinates
const cameraDistance = useRef(17);
const cameraTarget = useRef(new THREE.Vector3(0, 2, 0));
```

### 2. **Camera Position Calculation**

Every frame, the camera position is recalculated from spherical coordinates:

```typescript
const theta = cameraRotation.current.theta;
const phi = cameraRotation.current.phi;
const radius = cameraDistance.current;
const target = cameraTarget.current;

camera.position.x = target.x + radius * Math.sin(phi) * Math.cos(theta);
camera.position.y = target.y + radius * Math.cos(phi);
camera.position.z = target.z + radius * Math.sin(phi) * Math.sin(theta);
camera.lookAt(target);
```

### 3. **Mouse Handlers**

#### **handleMouseDown**
- **Pan Mode**: Records starting mouse position and sets `isPanning` flag
- **Pick Mode**: Raycasts to detect asset clicks and starts dragging

```typescript
if (interactionMode === 'pan') {
    isPanning.current = true;
    previousMousePosition.current = { x: mouseX, y: mouseY };
    return;
}
```

#### **handleMouseMove**
- **Pan Mode**: Calculates mouse delta and updates spherical coordinates
- **Pick Mode**: Updates dragged asset position

```typescript
if (interactionMode === 'pan' && isPanning.current) {
    const deltaX = mouseX - previousMousePosition.current.x;
    const deltaY = mouseY - previousMousePosition.current.y;

    // Update spherical coordinates
    cameraRotation.current.theta -= deltaX * 0.005;
    cameraRotation.current.phi -= deltaY * 0.005;

    // Clamp phi to prevent flipping
    cameraRotation.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotation.current.phi));

    previousMousePosition.current = { x: mouseX, y: mouseY };
}
```

#### **handleMouseUp**
- Stops both panning and dragging
- Handles drop validation for pick mode

```typescript
// Stop panning
if (isPanning.current) {
    isPanning.current = false;
}
```

#### **handleWheel**
- Adjusts camera distance (zoom) in pan mode

```typescript
const handleWheel = (event: React.WheelEvent) => {
    if (interactionMode === 'pan') {
        event.preventDefault();
        const delta = event.deltaY * 0.01;
        cameraDistance.current = Math.max(5, Math.min(30, cameraDistance.current + delta));
    }
};
```

---

## Features

### ✅ **Pan Mode**
- **Rotate**: Click and drag to rotate camera around the scene
- **Zoom**: Mouse wheel to zoom in/out (distance: 5-30 units)
- **Smooth**: Continuous camera updates every frame
- **Constrained**: Phi angle clamped to prevent camera flipping
- **Cursor**: "grab" when idle, "grabbing" when panning

### ✅ **Pick Mode**
- **Drag Assets**: Click and drag Bunsen Burner or Cooling Plate
- **Floating Animation**: Assets bob with sine wave
- **Floating Card**: Shows asset name and instructions
- **Placeholders**: Visual guides for drop zones
- **Drop Validation**: Checks distance to beaker
- **Cursor**: "pointer" when hovering, "grabbing" when dragging

---

## Advantages Over OrbitControls

1. **No Event Conflicts**: Full control over mouse event handling
2. **Dual Mode Support**: Seamless switching between pan and pick
3. **Customizable**: Easy to adjust rotation speed, zoom limits, etc.
4. **Lightweight**: No external control library needed
5. **Predictable**: Exact control over camera behavior

---

## Configuration

### Rotation Sensitivity
```typescript
cameraRotation.current.theta -= deltaX * 0.005; // Adjust multiplier
cameraRotation.current.phi -= deltaY * 0.005;   // Adjust multiplier
```

### Zoom Limits
```typescript
cameraDistance.current = Math.max(5, Math.min(30, cameraDistance.current + delta));
//                                 ↑ min        ↑ max
```

### Vertical Angle Limits (Prevent Flip)
```typescript
cameraRotation.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotation.current.phi));
//                                         ↑ min (near top)    ↑ max (near bottom)
```

### Initial Camera Position
```typescript
const cameraRotation = useRef({ theta: 0, phi: Math.PI / 4 }); // 45° from top
const cameraDistance = useRef(17); // Distance from target
const cameraTarget = useRef(new THREE.Vector3(0, 2, 0)); // Looking at (0, 2, 0)
```

---

## How It Works

### Frame-by-Frame Process

1. **User Input** → Mouse/wheel events update refs
2. **Animation Loop** → Calculates camera position from spherical coords
3. **Camera Update** → Sets position and lookAt target
4. **Render** → Scene rendered with new camera position

### Spherical to Cartesian Conversion

```
x = target.x + r × sin(φ) × cos(θ)
y = target.y + r × cos(φ)
z = target.z + r × sin(φ) × sin(θ)
```

Where:
- `r` = radius (distance from target)
- `θ` = theta (horizontal angle)
- `φ` = phi (vertical angle)
- `target` = point camera looks at

---

## Files Modified
- `/home/gladwin/Documents/Freelance/Chem-Z/chem-z/components/simulations/components/subcomponents/lab 1/PhaseChangeAdventure3D.tsx`

## Testing Checklist
- [x] Pan mode rotates camera smoothly
- [x] Pan mode zooms with mouse wheel
- [x] Pick mode drags assets
- [x] Pick mode shows floating card
- [x] Pick mode shows placeholders
- [x] Smooth transition between modes
- [x] No event conflicts
- [x] Proper cursor feedback
- [x] Camera doesn't flip upside down
- [x] Zoom limits enforced
