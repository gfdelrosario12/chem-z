"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = {
  id: number | string;
  title: string;
  description: string;
  type: "QUIZ" | "ACTIVITY" | "lab" | "assignment" | "project";
  quizNumber?: number;
  fileUrl?: string;
};

export default function ClassFeedPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const isValidCourseId = (id: string | undefined): id is string => {
    return id !== undefined && id !== null && id.toString() !== "undefined";
  };

  useEffect(() => {
    if (isValidCourseId(courseId)) fetchActivities(courseId);
  }, [courseId]);

  const fetchActivities = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : data.activities ?? []);
    } catch (err) {
      console.error(err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Class Feed</h1>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400">Loading activities...</p>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="bg-gray-800 border-gray-700"
              >
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex flex-col">
                    <CardTitle className="text-xl font-semibold">
                      {activity.title}
                    </CardTitle>
                    <div className="mt-1 text-sm text-gray-400">
                      {activity.type.charAt(0).toUpperCase() +
                        activity.type.slice(1)}
                    </div>
                  </div>

                  {activity.type === "QUIZ" && activity.quizNumber && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() =>
                        router.push(`/dashboard/quiz/${activity.quizNumber}`)
                      }
                    >
                      View Simulation
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-2 text-gray-300">
                  <p>{activity.description}</p>
                  {activity.fileUrl && (
                    <a
                      href={activity.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View File
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500">
                No activities found for this class.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
