"use client";

import { useEffect, useState } from "react";
import { CreateCourseModal } from "./class-management-form/CreateCourseModal";
import { UpdateCourseModal } from "./class-management-form/UpdateCourseModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

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

export function ClassManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses
  useEffect(() => {
    fetch(`${API_BASE}/courses`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Course[]) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch students
  useEffect(() => {
    fetch(`${API_BASE}/students/dto`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data: Student[]) => setAllStudents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // Fetch teachers
  useEffect(() => {
    fetch(`${API_BASE}/teachers`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Teacher[]) => setAllTeachers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  const openCreateModal = () => {
    setSelectedCourse(null);
    setShowCreateModal(true);
  };

  const openUpdateModal = (course: Course) => {
    setSelectedCourse(course);
    setShowUpdateModal(true);
  };

  const handleCreate = async (data: {
    courseName: string;
    description: string;
    teacherId: number;
    studentIds: number[];
  }) => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  const handleUpdate = async (data: {
    courseName: string;
    description: string;
    teacherId: number;
    studentIds: number[];
  }) => {
    if (!selectedCourse) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Error updating course:", err);
    }
  };

  // Add this function inside ClassManagement
  const handleDelete = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      // Remove from state
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-700 bg-clip-text text-transparent">
          Class Management
        </h1>
        <button
          onClick={openCreateModal}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
        >
          + Create Course
        </button>
      </div>

      {/* Courses Table */}
      {courses.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No courses found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 border-b text-left">ID</th>
                <th className="px-4 py-3 border-b text-left">Course Name</th>
                <th className="px-4 py-3 border-b text-left">Teacher</th>
                <th className="px-4 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 border-b">{course.id}</td>
                  <td className="px-4 py-3 border-b">{course.courseName}</td>
                  <td className="px-4 py-3 border-b">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </td>
                  <td className="px-4 py-3 border-b space-x-2">
                    <button
                      onClick={() => openUpdateModal(course)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
                    >
                      View / Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-medium shadow-md hover:from-red-600 hover:to-red-800 transition-all duration-200"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        allTeachers={allTeachers}
        allStudents={allStudents}
        onCreate={async ({ courseName, description, teacherId, studentIds }) => {
          try {
            const res = await fetch(`${API_BASE}/courses?teacherId=${teacherId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ courseName, description, studentIds }),
            });
            const created = await res.json();
            setCourses((prev) => [...prev, created]);
            setShowCreateModal(false);
          } catch (err) {
            console.error(err);
          }
        }}
      />

      {selectedCourse && (
        <UpdateCourseModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          course={selectedCourse}
          allTeachers={allTeachers}
          allStudents={allStudents}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
