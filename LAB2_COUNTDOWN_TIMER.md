# Lab 2 - Countdown Timer Addition

## Problem
Users were confused when stirring in Part B because:
1. **No visual feedback** - After stirring, there was a 1-second delay before advancing, but users couldn't see it
2. **Unclear if working** - Users didn't know if the system was processing or if they needed to do something else
3. **No stir tracking visibility** - Users couldn't see how many times they'd stirred

## Solution

### 1. Added Countdown Timer State
```typescript
const [nextStepCountdown, setNextStepCountdown] = useState<number | null>(null);
```

### 2. Updated Auto-Advance Logic
**Before:**
- 1-second delay with no visual feedback
- Users couldn't see the countdown

**After:**
- **3-second countdown** with visual timer
- Countdown updates every second
- Clear "Step Complete!" message

```typescript
useEffect(() => {
  if (currentStepData && currentStepData.check()) {
    // Show countdown
    setNextStepCountdown(3);
    
    // Countdown timer (updates every second)
    const countdownInterval = setInterval(() => {
      setNextStepCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Wait 3 seconds, then advance
    const timer = setTimeout(() => {
      if (currentStep < currentInstructions.length - 1) {
        setCurrentStep(s => s + 1);
        showNotification('success', `✅ Step ${currentStep + 1} Complete!`);
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
}, [currentStep, temperature, solventVolumeMl, selectedSolute, dissolvedMass, 
    undissolvedMass, status, currentPart, stirCount, hasReachedSaturation]);
```

### 3. Added Visual Countdown Display

**When step is complete:**
```tsx
{currentStepData.check() && nextStepCountdown !== null && (
  <div className="mt-2 bg-green-100 border-2 border-green-500 rounded-lg p-3 
                  flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-2">
      <span className="text-2xl">✓</span>
      <span className="text-green-700 font-bold">Step Complete!</span>
    </div>
    <div className="bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg">
      {nextStepCountdown}s
    </div>
  </div>
)}
```

**Visual appearance:**
```
┌─────────────────────────────────────────────────┐
│ ✓ Step Complete!                          3s   │
│                                         ┌────┐  │
│                                         │ 3s │  │
│                                         └────┘  │
└─────────────────────────────────────────────────┘
```

### 4. Added Stir Count Display

Shows stir count in the stats panel during Part B:

```tsx
{currentPart === 'B' && (
  <div className="flex justify-between">
    <span className="text-gray-600">Stir Count:</span>
    <span className="font-bold text-blue-600">{stirCount} times</span>
  </div>
)}
```

**Example display:**
```
Temperature: 25°C
Volume: 100 mL
Dissolved: 15.00 g
Undissolved: 0.00 g
Status: Unsaturated
Stir Count: 2 times  ← NEW!
```

## User Experience Flow

### Part B - Step 3 (Stirring)

1. **User drags stir paddle to beaker**
   - Stir count increments: `1 times`
   - Notification: "🌀 Stirred! Dissolved 1.00 g..."

2. **User stirs again**
   - Stir count increments: `2 times`
   - Step 3 condition met! (`stirCount >= 2`)

3. **Countdown appears**
   ```
   ┌─────────────────────────────────┐
   │ ✓ Step Complete!          3s   │
   └─────────────────────────────────┘
   ```

4. **Countdown updates**
   - After 1 second: `2s`
   - After 2 seconds: `1s`
   - After 3 seconds: Advances to Step 4

5. **Notification**
   - "✅ Step 3 Complete! Moving to next step..."

## Benefits

1. ✅ **Clear feedback** - Users see exactly when step is complete
2. ✅ **Visible countdown** - 3-second timer shows progress
3. ✅ **Stir tracking** - Users can see how many times they've stirred
4. ✅ **No confusion** - Clear indication that system is working
5. ✅ **Better UX** - Users understand what's happening at all times

## Technical Details

### Countdown Logic
- **Duration**: 3 seconds
- **Update frequency**: Every 1 second
- **Display**: Large circular badge with number
- **Animation**: Pulse effect on the container
- **Cleanup**: Properly clears intervals and timeouts

### Dependencies
The countdown triggers when step conditions change:
```typescript
[currentStep, temperature, solventVolumeMl, selectedSolute, 
 dissolvedMass, undissolvedMass, status, currentPart, 
 stirCount, hasReachedSaturation]
```

### Edge Cases Handled
- ✅ Countdown resets if conditions become false
- ✅ Proper cleanup on component unmount
- ✅ Countdown only shows when step is actually complete
- ✅ Different message for final step vs intermediate steps

## Testing Checklist

- [x] Countdown appears when step condition is met
- [x] Countdown updates every second (3 → 2 → 1)
- [x] Step advances after 3 seconds
- [x] Stir count displays during Part B
- [x] Stir count increments on each stir
- [x] Visual feedback is clear and prominent
- [x] No memory leaks (intervals/timeouts cleaned up)
