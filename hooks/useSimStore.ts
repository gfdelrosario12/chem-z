import { create } from "zustand";

interface SimState {
  step: number;
  points: number;
  completedSteps: number[];
  incrementStep: () => void;
  addPoints: (pts: number) => void;
}

export const useSimStore = create<SimState>((set: (arg0: { (state: any): { step: any; }; (state: any): { points: any; completedSteps: any[]; }; }) => any) => ({
  step: 0,
  points: 0,
  completedSteps: [],
  incrementStep: () => set((state) => ({
    step: state.step + 1,
    points: state.points,
    completedSteps: state.completedSteps,
  })),
  addPoints: (pts: any) =>
    set((state) => ({
      step: state.step,
      points: state.points + pts,
      completedSteps: [...state.completedSteps, state.step],
    })),
}));
