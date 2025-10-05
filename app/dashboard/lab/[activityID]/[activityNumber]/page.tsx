"use client";

import { useParams } from "next/navigation";
import QuizSimulation from "../../../../../components/QuizSimulation";

export default function QuizPage() {
  // 🧭 Get route parameters
  const { activityID, activityNumber } = useParams();

  // 🧮 Convert activityNumber to number for easier use
  const quizNumber = Number(activityNumber);

  console.log("👉 Route Params:", { activityID, activityNumber });
  console.log("👉 Extracted quizNumber:", quizNumber);

  // 🚨 Optional: Handle invalid or missing values
  if (!activityID || isNaN(quizNumber)) {
    return (
      <div className="min-h-screen p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold text-red-400">
          Invalid or missing quiz parameters.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Lab {quizNumber} (Activity ID: {activityID})
      </h1>

      {/* 🧩 Pass both IDs to your simulation component */}
      <QuizSimulation
        activityID={activityID.toString()}
        quizNumber={quizNumber}
      />
    </div>
  );
}
