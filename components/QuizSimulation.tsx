"use client";

import Unit1Simulation from "./simulations/Unit1Simulation";
import Unit2Simulation from "./simulations/Unit2Simulation";

interface QuizSimulationProps {
  quizNumber: number;
}

const quizMap: Record<number, React.FC> = {
  1: Unit1Simulation,
  2: Unit2Simulation,
};

const QuizSimulation: React.FC<QuizSimulationProps> = ({ quizNumber }) => {
  const SimulationComponent = quizMap[quizNumber];

  if (!SimulationComponent) {
    return <div>Simulation not available for Quiz {quizNumber}</div>;
  }

  return <SimulationComponent />;
};

export default QuizSimulation;
