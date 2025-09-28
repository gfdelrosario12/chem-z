"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActivityType = "QUIZ" | "ACTIVITY";

interface Props {
  courseId: string;
  onActivityCreated: (activity: any) => void;
}

export default function CreateActivityModal({ courseId, onActivityCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ActivityType>("QUIZ");
  const [file, setFile] = useState<File | null>(null);
  const [quizNumber, setQuizNumber] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) fetchActivities();
  }, [courseId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${courseId}`);
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

  const handleActivityCreated = (newActivity: Activity) => {
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl: string | null = null;

      if (type === "ACTIVITY" && file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.fileUrl;
      }

      const payload: any = { title, description, type, courseId };
      if (type === "ACTIVITY") payload.fileUrl = fileUrl;
      if (type === "QUIZ") payload.quizNumber = quizNumber;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create activity");
      const newActivity = await res.json();
      onActivityCreated(newActivity);

      // Reset form
      setOpen(false);
      setTitle("");
      setDescription("");
      setType("QUIZ");
      setFile(null);
      setQuizNumber(1);
    } catch (err) {
      console.error(err);
      alert("Error creating activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#101828" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Class Feed</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Activity</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-200">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Type</label>
                <Select
                  value={type}
                  onValueChange={(value: ActivityType) => setType(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="ACTIVITY">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "ACTIVITY" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-white"
                    required
                  />
                </div>
              )}

              {type === "QUIZ" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200">Quiz Number</label>
                  <Select
                    value={String(quizNumber)}
                    onValueChange={(value) => setQuizNumber(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a quiz number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Activity"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Activities List */}
        <div className="space-y-4 mt-4">
          {loading && <p className="text-gray-300">Loading activities...</p>}

          {!loading && activities.length === 0 && (
            <p className="text-gray-300">No activities yet for this class.</p>
          )}

          {!loading &&
            Array.isArray(activities) &&
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="shadow-sm hover:shadow-md transition-shadow bg-gray-900 border border-gray-700 rounded-lg"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-300">
                  <p>{activity.description}</p>
                  {activity.fileUrl && (
                    <a
                      href={activity.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-400"
                    >
                      View File
                    </a>
                  )}
                  <p className="mt-1 text-sm text-gray-400 font-medium">{activity.type}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}