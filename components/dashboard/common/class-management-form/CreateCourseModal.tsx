"use client";

import { useState, useRef, useEffect } from "react";
import { Teacher, Student } from "./types";
import { UserFormModal } from "./UseFormModal";

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTeachers: Teacher[];
    allStudents: Student[];
    onCreate: (data: {
        courseName: string;
        description: string;
        teacherId: number;
        studentIds: number[];
    }) => void;
}

export function CreateCourseModal({
    isOpen,
    onClose,
    allTeachers,
    allStudents,
    onCreate,
}: CreateCourseModalProps) {
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [studentIds, setStudentIds] = useState<number[]>([]);
    const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
    const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close students dropdown when clicking outside
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
        onCreate({ courseName, description, teacherId, studentIds });
        setCourseName("");
        setDescription("");
        setTeacherId(null);
        setStudentIds([]);
        onClose();
    };

    return (
        <UserFormModal
            title="Create Course"
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel="Create"
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
        </UserFormModal>
    );
}
