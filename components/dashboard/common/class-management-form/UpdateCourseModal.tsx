"use client";

import { useState, useRef, useEffect } from "react";
import { Teacher, Student, Course } from "./types";
import { UserFormModal } from "./UseFormModal";

interface UpdateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  allTeachers: Teacher[];
  allStudents: Student[];
  onUpdate: (data: {
    courseName: string;
    description: string;
    teacherId: number;
    studentIds: number[];
  }) => void;
}

export function UpdateCourseModal({
  isOpen,
  onClose,
  course,
  allTeachers,
  allStudents,
  onUpdate,
}: UpdateCourseModalProps) {
  const [courseName, setCourseName] = useState(course.courseName);
  const [description, setDescription] = useState(course.description);
  const [teacherId, setTeacherId] = useState(course.teacher.id);
  const [studentIds, setStudentIds] = useState<number[]>([]);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

  useEffect(() => {
    fetch(`${API_BASE}/courses/${course.id}/students`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Student[]) => setStudentIds(data.map((s) => s.id)))
      .catch(console.error);
  }, [course.id]);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStudentsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStudent = (id: number) => {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!teacherId) return;
    onUpdate({ courseName, description, teacherId, studentIds });
    onClose();
  };

  return (
    <UserFormModal
      title={`Update Course: ${course.courseName}`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    >
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
      />

      {/* Teacher Dropdown */}
      <div className="relative mb-2">
        <div
          onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
          className="w-full p-2 mb-2 border rounded cursor-pointer bg-blue-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
        >
          {teacherId
            ? (() => {
              const t = allTeachers.find((t) => t.id === teacherId);
              return t ? `${t.id} - ${t.firstName} ${t.lastName}` : "Select Teacher";
            })()
            : "Select Teacher"}
        </div>
        {teacherDropdownOpen &&
          allTeachers.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setTeacherId(t.id);
                setTeacherDropdownOpen(false);
              }}
              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              {t.id} - {t.firstName} {t.lastName}
            </div>
          ))}
      </div>

      {/* Students Multi-Select */}
      <div ref={dropdownRef} className="relative">
        <div
          onClick={() => setStudentsDropdownOpen(!studentsDropdownOpen)}
          className="w-full p-2 mb-2 border rounded cursor-pointer bg-blue-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
        >
          {studentIds.length === 0
            ? "Select students..."
            : allStudents
              .filter((s) => studentIds.includes(s.id))
              .map((s) => `${s.id} - ${s.firstName} ${s.lastName}`)
              .join(", ")}
        </div>
        {studentsDropdownOpen &&
          allStudents.map((s) => (
            <div
              key={s.id}
              onClick={() => toggleStudent(s.id)}
              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between cursor-pointer"
            >
              <span>
                {s.id} - {s.firstName} {s.lastName}
              </span>
              {studentIds.includes(s.id) && <span>✅</span>}
            </div>
          ))}
      </div>

    </UserFormModal>
  );
}
