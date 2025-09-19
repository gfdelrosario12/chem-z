"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; // Using env variable

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Course {
  id: number;
  courseName: string;
  description: string;
  teacher: Teacher;
}

interface Enrollment {
  id: number;
  student: Student;
  grade?: number;
}

export function ClassManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    description: "",
    teacherId: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch(`${API_BASE}/courses`, { credentials: "include" });
      const data = await res.json();
      setCourses(data);
      setLoading(false);
    };

    const fetchTeachers = async () => {
      const res = await fetch(`${API_BASE}/teachers`, { credentials: "include" });
      const data = await res.json();
      setTeachers(data);
    };

    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchStudents = async (courseId: number) => {
    const res = await fetch(`${API_BASE}/courses/${courseId}/students`, { credentials: "include" });
    const data = await res.json();
    setStudents(data);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchStudents(course.id);
  };

  const handleEnrollStudent = async (courseId: number) => {
    const studentId = prompt("Enter Student ID:");
    if (!studentId) return;

    await fetch(`${API_BASE}/courses/${courseId}/enroll/${studentId}`, {
      method: "POST",
      credentials: "include",
    });

    fetchStudents(courseId);
  };

  const handleUpdateGrade = async (enrollmentId: number) => {
    const grade = prompt("Enter grade:");
    if (!grade) return;

    await fetch(`${API_BASE}/courses/enrollment/${enrollmentId}/grade?grade=${grade}`, {
      method: "PUT",
      credentials: "include",
    });

    if (selectedCourse) fetchStudents(selectedCourse.id);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.courseName || !newCourse.teacherId) {
      alert("Course name and teacher are required.");
      return;
    }

    const res = await fetch(`${API_BASE}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        courseName: newCourse.courseName,
        description: newCourse.description,
        teacherId: Number(newCourse.teacherId),
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
      setNewCourse({ courseName: "", description: "", teacherId: "" });
      setIsModalOpen(false);
    } else {
      alert("Failed to create course");
    }
  };

  if (loading) {
    return <p className="p-6 text-blue-500 animate-pulse">Loading courses…</p>;
  }

  return (
    <div className="p-6">
      {/* ...rest of your JSX */}
    </div>
  );
}
