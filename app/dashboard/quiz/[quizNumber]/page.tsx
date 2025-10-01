"use client";

import { useParams } from "next/navigation";
import QuizSimulation from "../../../../components/QuizSimulation";

export default function QuizPage() {
  const params = useParams();
  const quizNumber = Array.isArray(params.quizNumber)
    ? Number(params.quizNumber[0])
    : Number(params.quizNumber);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Lab {quizNumber}</h1>
      <QuizSimulation quizNumber={quizNumber} />
    </div>
  );
}
