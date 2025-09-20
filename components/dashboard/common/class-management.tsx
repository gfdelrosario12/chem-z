"use client";

import { useEffect, useState, useRef } from "react";

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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [editCourseName, setEditCourseName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTeacherId, setEditTeacherId] = useState<number | null>(null);
  const [editStudentIds, setEditStudentIds] = useState<number[]>([]);
  const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all courses
  useEffect(() => {
    fetch(`${API_BASE}/courses`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Course[]) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch all students
  useEffect(() => {
    fetch(`${API_BASE}/users?role=STUDENT`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Student[]) => setAllStudents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // Fetch all teachers
  useEffect(() => {
    fetch(`${API_BASE}/teachers`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Teacher[]) => setAllTeachers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setStudentsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setEditCourseName(course.courseName);
    setEditDescription(course.description);
    setEditTeacherId(course.teacher.id);

    fetch(`${API_BASE}/courses/${course.id}/students`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: Student[]) => {
        setEditStudentIds(data.map((s) => s.id));
      })
      .catch((err) => console.error("Error fetching students:", err));

    setShowModal(true);
  };

  const toggleStudent = (id: number) => {
    setEditStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedCourse || editTeacherId === null) return;

    const dto = {
      courseName: editCourseName,
      description: editDescription,
      teacherId: editTeacherId,
      studentIds: editStudentIds,
    };

    try {
      const res = await fetch(`${API_BASE}/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update course: ${res.status} ${text}`);
      }

      const updated = await res.json();
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setShowModal(false);
    } catch (err) {
      console.error("Error updating course:", err);
    }
  };

  return (
    <div className="p-6">
      {/* Courses Table */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-700 bg-clip-text text-transparent">
          Class Management
        </h1>
        <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200">
          + Create Course
        </button>
      </div>

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
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
                    >
                      View / Edit
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 text-white font-medium shadow-md hover:from-blue-800 hover:to-blue-950 transition-all duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-1/2 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-emerald-600">
              Edit Course: {selectedCourse.courseName}
            </h2>

            <div className="space-y-3">
              {/* Course Name */}
              <div>
                <label className="font-semibold">Course Name:</label>
                <input
                  type="text"
                  value={editCourseName}
                  onChange={(e) => setEditCourseName(e.target.value)}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold">Description:</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>

              {/* Teacher Dropdown */}
              <div>
                <label className="font-semibold">Teacher:</label>
                <select
                  value={editTeacherId || ""}
                  onChange={(e) => setEditTeacherId(Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded mt-1"
                >
                  <option value="">Select Teacher</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Students Dropdown */}
              <div ref={dropdownRef} className="relative">
                <label className="font-semibold">Enrolled Students:</label>
                <div
                  onClick={() => setStudentsDropdownOpen(!studentsDropdownOpen)}
                  className="w-full border px-2 py-1 rounded mt-1 cursor-pointer bg-white dark:bg-gray-800"
                >
                  {editStudentIds.length === 0
                    ? "Select students..."
                    : allStudents
                        .filter((s) => editStudentIds.includes(s.id))
                        .map((s) => s.firstName + " " + s.lastName)
                        .join(", ")}
                </div>

                {studentsDropdownOpen && (
                  <div className="absolute z-10 w-full max-h-48 overflow-y-auto mt-1 border rounded bg-white dark:bg-gray-800 shadow-lg">
                    {allStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => toggleStudent(s.id)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between cursor-pointer"
                      >
                        <span>
                          {s.firstName} {s.lastName}
                        </span>
                        {editStudentIds.includes(s.id) && <span>✅</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
