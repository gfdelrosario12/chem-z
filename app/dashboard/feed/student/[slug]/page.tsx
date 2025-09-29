"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Activity = {
  id: number;
  title: string;
  description: string;
  fileUrl?: string;
  type: "QUIZ" | "ACTIVITY";
};

export default function TeacherClassFeed() {
  const { slug } = useParams(); // courseId
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"QUIZ" | "ACTIVITY">("ACTIVITY");

  // Fetch activities when slug changes
  useEffect(() => {
    if (slug) fetchActivities();
  }, [slug]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${slug}/activities`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();

      // Handle cases where data is not an array
      setActivities(Array.isArray(data) ? data : data.activities ?? []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!title.trim()) return alert("Title is required");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${slug}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type }),
      });

      if (!res.ok) throw new Error("Failed to create activity");
      const newActivity: Activity = await res.json();

      setActivities((prev) => [newActivity, ...prev]);
      setTitle("");
      setDescription("");
      setType("ACTIVITY");
    } catch (err) {
      console.error("Error creating activity:", err);
      alert("Failed to create activity. Check console for details.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Class Feed</h1>

      {/* Create Activity Form */}
      <div className="mb-6 p-4 border rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">Create Activity</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "QUIZ" | "ACTIVITY")}
          className="mb-2 p-2 border rounded"
        >
          <option value="ACTIVITY">Activity</option>
          <option value="QUIZ">Quiz</option>
        </select>
        <Button onClick={handleCreateActivity}>Create Activity</Button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {loading && <p>Loading activities...</p>}

        {!loading && activities.length === 0 && (
          <p className="text-gray-500">No activities yet for this class.</p>
        )}

        {!loading &&
          Array.isArray(activities) &&
          activities.map((activity) => (
            <Card key={activity.id} className="shadow-sm">
              <CardHeader>
                <CardTitle>{activity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{activity.description}</p>
                {activity.fileUrl && (
                  <a
                    href={activity.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
                  </a>
                )}
                <p className="mt-1 text-sm text-gray-500">{activity.type}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
