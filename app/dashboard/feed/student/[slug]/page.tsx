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

  const logReceivedData = (data: any) => {
    console.group("📥 Received Activities Data");
    console.log("Raw Data:", data);
    if (Array.isArray(data)) {
      data.forEach((a, i) => console.log(`Activity #${i + 1}:`, a));
    } else if (data.activities) {
      data.activities.forEach((a: any, i: number) => console.log(`Activity #${i + 1}:`, a));
    }
    console.groupEnd();
  };

  const isValidCourseId = (id: string | undefined): id is string =>
    id !== undefined && id !== null && id.toString() !== "undefined";

  useEffect(() => {
    if (isValidCourseId(courseId)) fetchActivities(courseId);
  }, [courseId]);

  const fetchActivities = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${id}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      logReceivedData(data); // <-- log the data here

      const formattedActivities: Activity[] = (Array.isArray(data) ? data : data.activities ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        type: (a.type ?? "ACTIVITY").toUpperCase() as Activity["type"],
        activityNumber: a.activityNumber,
        fileUrl: a.fileUrl,
        score: a.score ?? 0,
      }));

      setActivities(formattedActivities);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/${activityId}/score?score=100`,
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

  const handleNavigate = (activity: Activity) => {
    const activityID = activity.id;
    const activityNumber = activity.activityNumber ?? activity.id;

    if (activity.type === "LAB") {
      router.push(`/dashboard/lab/${activityID}/${activityNumber}`);
    } else if (activity.type === "QUIZ") {
      router.push(`/dashboard/quiz/${activityID}/${activityNumber}`);
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
              const type = activity.type ?? "ACTIVITY";

              return (
                <Card key={activity.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-col">
                      <CardTitle className="text-xl font-semibold">{activity.title}</CardTitle>
                      <div className="mt-1 text-sm text-gray-400">
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-900 bg-green-200 rounded-full">
                        Score: {activity.score} / 100
                      </span>

                      {/* LAB or QUIZ */}
                      {(type === "QUIZ" || type === "LAB") && (
                        <Button
                          size="sm"
                          className={`${type === "QUIZ"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-purple-600 hover:bg-purple-700"
                            } text-white`}
                          onClick={() => {
                            const activityID = activity.id;
                            const activityNumber = activity.activityNumber ?? activity.id;

                            if (type === "LAB") {
                              router.push(`/dashboard/lab/${activityID}/${activityNumber}`);
                            } else if (type === "QUIZ") {
                              router.push(`/dashboard/quiz/${activityID}/${activityNumber}`);
                            }
                          }}
                        >
                          {type === "QUIZ" ? "Take Quiz" : "Launch Lab"} {activity.activityNumber}
                        </Button>
                      )}

                      {/* ACTIVITY */}
                      {type === "ACTIVITY" && activity.fileUrl && activity.score < 100 && (
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
