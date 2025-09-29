"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActivityType = "QUIZ" | "ACTIVITY";

export default function CreateActivityPage() {
  const params = useParams();
  const courseId = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ActivityType>("QUIZ");
  const [file, setFile] = useState<File | null>(null);
  const [quizNumber, setQuizNumber] = useState<number | undefined>(1);
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${id}`);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("QUIZ");
    setFile(null);
    setQuizNumber(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCourseId(courseId)) return;

    setSubmitting(true);
    try {
      let fileUrl: string | null = null;

      if (type === "ACTIVITY" && file) {
        const presignRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/presigned-url`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name, contentType: file.type }),
          }
        );
        const { url } = await presignRes.json();
        await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        fileUrl = url.split("?")[0];
      }

      const payload: any = { title, description, type };
      if (type === "ACTIVITY") payload.fileUrl = fileUrl;
      if (type === "QUIZ") payload.quizNumber = quizNumber;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/course/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setOpen(false);
      resetForm();
      fetchActivities(courseId);
    } catch (err) {
      console.error(err);
      alert("Error creating activity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/${activityId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete activity");
      setActivities((prev) => prev.filter((act) => Number(act.id) !== activityId));
    } catch (err) {
      console.error(err);
      alert("Error deleting activity");
    }
  };

  const renderInputs = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="type">Activity Type</Label>
        <Select value={type} onValueChange={(val) => setType(val as ActivityType)}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="QUIZ">Quiz</SelectItem>
            <SelectItem value="ACTIVITY">Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === "QUIZ" ? (
        <div>
          <Label htmlFor="quizNumber">Quiz Number</Label>
          <Input id="quizNumber" type="number" min={1} value={quizNumber} onChange={(e) => setQuizNumber(Number(e.target.value))} />
        </div>
      ) : (
        <div>
          <Label htmlFor="file">File Upload</Label>
          <div className="flex items-center gap-2">
            <label
              htmlFor="file"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded cursor-pointer"
            >
              {file ? "Change File" : "Choose File"}
            </label>
            {file && <span className="text-gray-300 truncate max-w-xs">{file.name}</span>}
          </div>
          <Input
            id="file"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {submitting ? "Creating..." : "Create Activity"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Class Feed</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Activity</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Create New Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">{renderInputs()}</form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400">Loading activities...</p>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <Card key={activity.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-semibold">{activity.title}</CardTitle>
                    <div className="mt-1 text-sm text-gray-400">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-white hover:bg-red-700"
                    onClick={() => handleDelete(Number(activity.id))}
                  >
                    Delete
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-300">
                  <p>{activity.description}</p>
                  {activity.fileUrl && (
                    <a href={activity.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View File
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500">No activities found. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
