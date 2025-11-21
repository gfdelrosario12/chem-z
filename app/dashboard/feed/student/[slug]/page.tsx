"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = {
  id: number | string;
  title: string;
  description: string;
  type: "QUIZ" | "LAB" | "ACTIVITY";
  activityNumber?: number;
  fileUrl?: string;
  score: number;
};

export default function ClassFeedPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [retriesMap, setRetriesMap] = useState<Record<string, number>>({});

  // Replace with actual student ID from auth/session
  const studentId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (courseId) fetchActivities(courseId);
  }, [courseId]);

  const fetchActivities = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${id}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();

      const formattedActivities: Activity[] = (Array.isArray(data) ? data : data.activities ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        type: (a.type ?? "ACTIVITY").toUpperCase() as Activity["type"],
        activityNumber: a.activityNumber,
        fileUrl: a.fileUrl,
        score: 0, // default, will fetch next
      }));

      // Fetch individual scores and retries
      const activitiesWithScores = await Promise.all(
        formattedActivities.map(async (a) => {
          let retries = null;
          try {
            if (studentId && (a.type === "LAB" || a.type === "QUIZ")) {
              const retriesRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/${a.id}/retries/${studentId}`
              );
              if (retriesRes.ok) {
                retries = await retriesRes.json();
              }
            }
          } catch {}
          try {
            const scoreRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/${a.id}/score/${studentId}`
            );
            if (!scoreRes.ok) throw new Error("Failed to fetch score");
            const score = await scoreRes.json();
            return { ...a, score, retries };
          } catch {
            return { ...a, retries };
          }
        })
      );
      // Build retries map for quick lookup
      const retriesObj: Record<string, number> = {};
      activitiesWithScores.forEach((a) => {
        if (a.retries !== null && a.retries !== undefined) retriesObj[a.id] = a.retries;
      });
      setRetriesMap(retriesObj);
      setActivities(activitiesWithScores);
    } catch (err) {
      console.error(err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (activityId: number | string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/${activityId}/score/${studentId}?score=100`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to update score");

      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, score: 100 } : a))
      );
    } catch (err) {
      console.error(err);
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
            activities.map((activity) => {
              const isLocked = (activity.type === "LAB" || activity.type === "QUIZ") && retriesMap[activity.id] >= 3;
              return (
                <Card key={activity.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-col">
                      <CardTitle className="text-xl font-semibold">{activity.title}</CardTitle>
                      <div className="mt-1 text-sm text-gray-400">{activity.type}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-900 bg-green-200 rounded-full">
                        Score: {activity.score} / 100
                      </span>
                      {(activity.type === "QUIZ" || activity.type === "LAB") && (
                        <Button
                          size="sm"
                          className={`${activity.type === "QUIZ"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-purple-600 hover:bg-purple-700"
                          } text-white`}
                          onClick={() => {
                            if (isLocked) return;
                            router.push(
                              `/dashboard/${activity.type.toLowerCase()}/${activity.id}/${activity.activityNumber ?? activity.id}`
                            );
                          }}
                          disabled={isLocked}
                        >
                          {isLocked ? "Locked (Max Retries)" : activity.type === "QUIZ" ? "Take Quiz" : "Launch Lab"} {activity.activityNumber}
                        </Button>
                      )}
                      {activity.type === "ACTIVITY" && activity.fileUrl && activity.score < 100 && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => markAsDone(activity.id)}
                        >
                          Mark as Done
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-gray-300">
                    <p>{activity.description}</p>
                    {activity.fileUrl && (
                      <a
                        href={activity.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                        onClick={() => markAsDone(activity.id)}
                      >
                        View File
                      </a>
                    )}
                  </CardContent>
                  {isLocked && (
                    <div className="p-4 text-center text-red-400 font-bold">
                      🚫 You have exceeded the maximum number of retries (3) for this {activity.type.toLowerCase()}.
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500">No activities found for this class.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
