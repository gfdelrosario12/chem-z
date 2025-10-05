"use client";

import { useEffect } from "react";
import Unit1Simulation from "./simulations/Unit1Simulation";
import Unit2Simulation from "./simulations/Unit2Simulation";

interface QuizSimulationProps {
  activityID: string; // ✅ <-- declared as prop
  quizNumber: number;
}

// ✅ Map quiz number to the correct simulation
const quizMap: Record<number, React.FC<{ activityID: string }>> = {
  1: Unit1Simulation,
  2: Unit2Simulation,
};

const QuizSimulation: React.FC<QuizSimulationProps> = ({ activityID, quizNumber }) => {
  useEffect(() => {
    console.log("Received quizNumber:", quizNumber, "for activityID:", activityID);
  }, [quizNumber, activityID]);

  const SimulationComponent = quizMap[quizNumber];

  if (!SimulationComponent) {
    return <div>Simulation not available for Quiz {quizNumber}</div>;
  }

  // ✅ Here’s where we *pass activityID down* as a prop
  return <SimulationComponent activityID={activityID} />;
};

export default QuizSimulation;
