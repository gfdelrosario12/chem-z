# Lab 2 - Part B Progression Fix

## Problem
In **Part B (Reaching Saturation Point)**, users were adding almost all NaCl crystals but the progression wasn't advancing properly. The issue was caused by:

1. **Step 3 auto-advanced immediately** - Had `check: () => true` which meant it would skip without waiting for user to stir
2. **No tracking of user actions** - System didn't track if user actually stirred the solution
3. **Vague step requirements** - Steps didn't clearly indicate how much NaCl was needed (~36g for saturation at 25°C in 100mL)
4. **No saturation confirmation** - System didn't properly track when saturation point was actually reached

## Solution

### 1. Added State Tracking
```typescript
const [stirCount, setStirCount] = useState(0); // Track number of stirs
const [hasReachedSaturation, setHasReachedSaturation] = useState(false); // Track saturation
```

### 2. Updated Part B Steps

**Before:**
```typescript
'B': [
  { step: 2, text: '➕ Add 1.00 g NaCl crystal to beaker', check: () => dissolvedMass >= 3 || undissolvedMass > 0 },
  { step: 3, text: '🌀 Stir and observe the bottom', check: () => true }, // ❌ Auto-advances!
  { step: 4, text: '🔁 Keep adding 1.00 g at a time until crystals remain at bottom', check: () => undissolvedMass > 0 },
  { step: 5, text: '🎯 SATURATION POINT REACHED!', check: () => undissolvedMass > 0 && status === 'Saturated' },
]
```

**After:**
```typescript
'B': [
  { step: 2, text: '➕ Add NaCl crystals to beaker (need ~36g total for saturation)', check: () => dissolvedMass >= 10 || undissolvedMass > 0 },
  { step: 3, text: '🌀 Stir the solution (drag stir paddle to beaker)', check: () => stirCount >= 2 }, // ✅ Requires actual stirring
  { step: 4, text: '🔁 Keep adding NaCl until crystals remain at bottom (saturation ~36g)', check: () => undissolvedMass > 0 && dissolvedMass >= 30 },
  { step: 5, text: '🎯 SATURATION POINT REACHED!', check: () => undissolvedMass > 0 && status === 'Saturated' && hasReachedSaturation },
  { step: 6, text: '✅ Solution is saturated! Ready to continue.', check: () => undissolvedMass > 0 && hasReachedSaturation }
]
```

### 3. Updated Stir Action
```typescript
const stirAction = () => {
  setStirCount(c => c + 1); // ✅ Increment stir count
  const dissolveAmount = Math.min(undissolvedMass, 1);
  if (dissolveAmount > 0) {
    setDissolvedMass(d => d + dissolveAmount);
    setUndissolvedMass(u => u - dissolveAmount);
    showNotification('success', `🌀 Stirred! Dissolved ${dissolveAmount.toFixed(2)} g...`);
  }
};
```

### 4. Auto-Set Saturation Flag
```typescript
useEffect(() => {
  const solubility = computeSolubility_g_per_100ml(selectedSolute, temperature) * (solventVolumeMl / 100);
  if (Math.abs(dissolvedMass - solubility) < 1e-2) {
    setStatus("Saturated");
    // ✅ Mark saturation reached when we have both saturated status AND undissolved mass
    if (undissolvedMass > 0 && currentPart === 'B') {
      setHasReachedSaturation(true);
    }
  }
}, [temperature, solventVolumeMl, dissolvedMass, undissolvedMass, selectedSolute, currentPart]);
```

### 5. Reset State Properly
```typescript
const resetPartState = () => {
  setDissolvedMass(0);
  setUndissolvedMass(0);
  setStirCount(0); // ✅ Reset stir count
  setHasReachedSaturation(false); // ✅ Reset saturation flag
  // ... rest of reset logic
};
```

## How It Works Now

### Part B: Reaching Saturation Point

**Step 1:** Keep current setup (25°C, 100mL, NaCl) ✅  
**Step 2:** Add NaCl crystals (need ~36g total) - Advances when `dissolvedMass >= 10g`  
**Step 3:** Stir the solution - Requires **at least 2 stirs** (`stirCount >= 2`)  
**Step 4:** Keep adding NaCl until saturation - Requires `undissolvedMass > 0` AND `dissolvedMass >= 30g`  
**Step 5:** Saturation point reached - Requires `undissolvedMass > 0`, `status === 'Saturated'`, AND `hasReachedSaturation === true`  
**Step 6:** Ready to continue - Same as step 5

## Key Improvements

1. ✅ **Clear guidance**: Steps now indicate ~36g is needed for saturation
2. ✅ **Requires user action**: Step 3 won't advance until user stirs at least twice
3. ✅ **Proper validation**: Step 4 requires significant dissolved mass (30g+) before advancing
4. ✅ **Saturation confirmation**: System tracks when true saturation is reached
5. ✅ **Better UX**: Users understand what they need to do and how much to add

## NaCl Solubility Reference

At **25°C** in **100mL** water:
- **Solubility**: ~36g NaCl
- **Saturation point**: When dissolved mass ≈ 36g AND undissolved crystals remain at bottom
- **Each crystal**: 1g

Therefore, users need to add approximately **36-40 crystals** to reach saturation.

## Testing Checklist

- [x] Step 3 requires actual stirring (2+ stirs)
- [x] Step 4 requires significant NaCl addition (30g+)
- [x] Step 5 requires true saturation (undissolved mass + saturated status)
- [x] hasReachedSaturation flag set correctly
- [x] Reset properly clears all tracking variables
- [x] Clear user guidance on how much NaCl to add
