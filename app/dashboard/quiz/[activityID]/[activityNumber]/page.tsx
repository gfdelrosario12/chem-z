"use client";

import { useParams } from "next/navigation";
import QuizPage from "../../../../../components/quiz/QuizPage";

export default function QuizWrapper() {
  const params = useParams();

  console.log("Params from useParams():", params);

  const activityId = Number(params.activityID);      // ✅ correct key
  const activityNumber = Number(params.activityNumber);
  const unit: 1 | 2 | null = activityNumber === 1 || activityNumber === 2 ? (activityNumber as 1 | 2) : null;

  console.log("Parsed activityId:", activityId);
  console.log("Parsed activityNumber:", activityNumber);
  console.log("Unit:", unit);

  if (!activityId || !unit) {
    return <div className="p-4 text-red-600">Invalid quiz link</div>;
  }

  return <QuizPage activityId={activityId} unit={unit} />;
}
