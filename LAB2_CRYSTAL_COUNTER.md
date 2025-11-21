# Lab 2 - NaCl Crystal Counter & Replenish Button

## Problem
Users couldn't track how many NaCl crystals were available on the table, and once they used all crystals, they had no way to get more without resetting the entire experiment.

## Solution

### 1. Added Crystal Counter State
```typescript
const [availableCrystals, setAvailableCrystals] = useState(12); // Track available NaCl crystals
```

### 2. Created Replenish Function
```typescript
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
```

### 3. Updated Crystal Removal Logic
When a crystal is dissolved and removed from the scene, the counter is decremented:

```typescript
// In handleMouseUp (React event handler)
if (sceneRef.current) sceneRef.current.remove(draggedMeshRef.current);
if (soluteCrystalsRef.current) {
  soluteCrystalsRef.current = soluteCrystalsRef.current.filter(m => m !== draggedMeshRef.current);
}
setAvailableCrystals(prev => prev - 1); // ✅ Decrement counter
```

Also updated in the native pointer event handler for consistency.

### 4. Added UI Display

#### Crystal Counter
Shows in the status panel with color coding:
- **Green**: 5+ crystals available
- **Red**: < 5 crystals (running low!)

```tsx
<div className="flex justify-between items-center">
  <span className="text-gray-600">Available NaCl:</span>
  <span className={`font-bold ${availableCrystals < 5 ? 'text-red-600' : 'text-green-600'}`}>
    {availableCrystals} crystals
  </span>
</div>
```

#### Replenish Button
Beautiful gradient button that spawns 12 new crystals:

```tsx
<button
  onClick={replenishCrystals}
  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-500 
             hover:from-blue-600 hover:to-purple-600 text-white font-bold 
             py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all"
>
  🧂 Replenish NaCl Crystals (+12)
</button>
```

### 5. Reset Logic
The counter is reset to 12 when:
- Part is reset (`resetPartState()`)
- Game is reset (`handleReset()`)

```typescript
const resetPartState = () => {
  // ... other reset logic
  setAvailableCrystals(12); // Reset counter
};
```

## User Experience

### Initial State
```
Available NaCl: 12 crystals (green)
```

### After Using 8 Crystals
```
Available NaCl: 4 crystals (red - running low!)
```

### Click Replenish Button
```
🧂 Replenished 12 NaCl crystals!
Available NaCl: 16 crystals (green)
```

### Visual Feedback
1. **Counter updates** immediately when crystal is used
2. **Color changes** to red when < 5 crystals
3. **Notification** appears when replenishing
4. **Button animation** on hover (scales up 105%)

## Benefits

1. ✅ **Visibility** - Users can see how many crystals are available
2. ✅ **Warning** - Red color warns when running low
3. ✅ **Convenience** - No need to reset entire experiment
4. ✅ **Flexibility** - Can add more crystals anytime
5. ✅ **Tracking** - Accurate count of available resources

## Technical Details

### Counter Tracking
- **Initial**: 12 crystals (matches scene initialization)
- **Decrement**: When crystal is dissolved and removed
- **Increment**: When replenish button is clicked (+12)
- **Reset**: When part/game is reset (back to 12)

### Crystal Spawning
- **Position**: Arranged in a line on the table
- **Spacing**: 0.5 units apart
- **Properties**: Each crystal is 1g of NaCl
- **Visual**: Gray color, casts shadows

### Color Coding
```typescript
availableCrystals < 5 ? 'text-red-600' : 'text-green-600'
```

## Use Cases

### Part B: Reaching Saturation
Users need ~36-40 crystals to reach saturation:
- **Initial**: 12 crystals
- **After using all**: Click replenish → 12 more
- **After using those**: Click replenish → 12 more
- **After using those**: Click replenish → 12 more
- **Total available**: 48 crystals (more than enough!)

### Part C: Supersaturation
Users might need extra crystals for experimentation:
- Can replenish as many times as needed
- No limit on total crystals

### Part D: Temperature Tests
Multiple temperature tests require many crystals:
- Replenish between tests
- Never run out of resources

## Testing Checklist

- [x] Counter starts at 12
- [x] Counter decrements when crystal is used
- [x] Counter increments by 12 when replenish is clicked
- [x] Color changes to red when < 5 crystals
- [x] Replenish button spawns 12 new crystals
- [x] Notification appears on replenish
- [x] Counter resets to 12 on part reset
- [x] Counter resets to 12 on game reset
- [x] Works in both React and native event handlers
