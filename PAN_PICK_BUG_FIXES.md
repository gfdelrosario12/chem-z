# Pan and Pick Mode - Bug Fixes

## Issues Fixed

### 1. ✅ Pan Mode Not Working (Camera Not Moving)
**Problem:** Two issues:
1. OrbitControls were enabled but not updating in the animation loop
2. Mouse event handlers on the div were intercepting all mouse events, preventing OrbitControls from receiving them

**Solution:** 
1. Added `controls.update()` to the animation loop:
```typescript
// Update controls for pan mode
if (controlsRef.current) {
    controlsRef.current.update();
}
```

2. Conditionally attach mouse handlers only in pick mode:
```typescript
<div
    onMouseDown={interactionMode === 'pick' ? handleMouseDown : undefined}
    onMouseMove={interactionMode === 'pick' ? handleMouseMove : undefined}
    onMouseUp={interactionMode === 'pick' ? handleMouseUp : undefined}
    onMouseLeave={interactionMode === 'pick' ? handleMouseUp : undefined}
/>
```

**Result:** Pan mode now properly enables camera rotation, zoom, and panning.

---

### 2. ✅ Pick Mode - Floating Assets Not Visible
**Problem:** Floating animation was accumulating position offsets, causing assets to drift away.

**Solution:** Changed from additive position updates to absolute position based on sine wave:

**Before (Broken):**
```typescript
// This was accumulating and causing drift
burnerRef.current.position.y += floatOffset;
```

**After (Fixed):**
```typescript
// Absolute position based on sine wave
const baseY = 2.5;
const floatOffset = Math.sin(Date.now() * 0.003) * 0.15;
burnerRef.current.position.y = baseY + floatOffset;
```

**Result:** Assets now float smoothly with a sine wave animation while being dragged.

---

### 3. ✅ Pick Mode - Placeholders Not Showing
**Problem:** Multiple issues:
- Placeholders were being set in multiple places causing conflicts
- Drop validation was checking exact Y positions which conflicted with floating animation

**Solution:** 
1. Removed redundant placeholder visibility setting in `handleMouseDown`
2. Simplified drop validation to only check horizontal distance:

**Before:**
```typescript
// This failed because Y position was constantly changing due to float animation
isValidDrop = distToBeaker < 2.5 && itemPos.y > 3.5;
```

**After:**
```typescript
// Only check horizontal distance
isValidDrop = distToBeaker < 2.5;
```

3. Placeholder visibility is now controlled by the `draggedItem` state via useEffect:
```typescript
useEffect(() => {
    if (placeholderBurnerRef.current) {
        placeholderBurnerRef.current.visible = draggedItem === 'burner';
    }
    if (placeholderCoolingRef.current) {
        placeholderCoolingRef.current.visible = draggedItem === 'cooling';
    }
}, [draggedItem]);
```

**Result:** 
- Orange placeholder box appears below beaker when dragging burner
- Blue placeholder box appears above beaker when dragging cooling plate
- Both pulse with opacity and bob up/down for visual feedback

---

## Current Behavior

### Pan Mode (Camera Movement)
- ✅ Click "Pan" button
- ✅ OrbitControls enabled
- ✅ Can rotate camera by dragging
- ✅ Can zoom with mouse wheel
- ✅ Cannot pick up assets
- ✅ Cursor shows "grab"

### Pick Mode (Asset Interaction)
- ✅ Click "Pick" button
- ✅ OrbitControls disabled (camera frozen)
- ✅ Can click and drag Bunsen Burner or Cooling Plate
- ✅ Asset scales up to 120% when picked
- ✅ Asset floats with smooth sine wave animation
- ✅ Floating card appears showing asset name
- ✅ Placeholder guide appears at drop zone
- ✅ Placeholder pulses and bobs
- ✅ Drop near beaker to activate
- ✅ Drop away from beaker to return to table
- ✅ Cursor changes to "pointer" when hovering, "grabbing" when dragging

---

## Technical Details

### Animation Loop Changes
1. Added `controls.update()` for OrbitControls
2. Changed floating animation from additive to absolute positioning
3. Separated drag position updates (in `handleMouseMove`) from floating animation (in animation loop)

### Drop Validation Changes
- Removed Y-position checks that conflicted with floating animation
- Now only validates horizontal distance to beaker
- Burner: within 2 units of beaker
- Cooling Plate: within 2.5 units of beaker

### State Management
- Placeholder visibility controlled by `draggedItem` state
- Removed redundant manual visibility setting
- Clean separation of concerns between drag state and visual feedback

---

## Files Modified
- `/home/gladwin/Documents/Freelance/Chem-Z/chem-z/components/simulations/components/subcomponents/lab 1/PhaseChangeAdventure3D.tsx`

## Testing Checklist
- [x] Pan mode enables camera movement
- [x] Pick mode freezes camera
- [x] Assets float when dragged
- [x] Floating card appears with asset name
- [x] Placeholders appear and pulse
- [x] Drop validation works correctly
- [x] Assets return to table when dropped far from beaker
- [x] Assets activate when dropped near beaker
