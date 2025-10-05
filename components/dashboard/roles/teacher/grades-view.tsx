"use client";

import { useEffect, useState } from "react";

type StudentGrade = {
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  grade: number | null;
};

type TeacherInfo = {
  firstName: string;
  lastName: string;
};

export default function GradesView() {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const teacherId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    if (!teacherId) {
      setError("Teacher not logged in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch teacher info
        const teacherRes = await fetch(`${baseUrl}/teachers/${teacherId}`);
        if (!teacherRes.ok) throw new Error("Failed to fetch teacher info");
        const teacherData: TeacherInfo = await teacherRes.json();
        setTeacher(teacherData);

        // Fetch all grades directly from the new endpoint
        const gradesRes = await fetch(`${baseUrl}/teachers/${teacherId}/grades`);
        if (!gradesRes.ok) throw new Error("Failed to fetch grades");
        const gradesData: StudentGrade[] = await gradesRes.json();

        setGrades(gradesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  if (loading) return <div>Loading grades...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {teacher && (
        <h2 className="text-2xl font-bold mb-2">
          Grades for {teacher.firstName} {teacher.lastName}
        </h2>
      )}
      {grades.length === 0 ? (
        <div>No students enrolled yet.</div>
      ) : (
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1">Course</th>
              <th className="border border-gray-300 px-2 py-1">Student</th>
              <th className="border border-gray-300 px-2 py-1">Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={`${g.studentId}-${g.courseId}`} className="text-center">
                <td className="border border-gray-300 px-2 py-1">{g.courseName}</td>
                <td className="border border-gray-300 px-2 py-1">{g.studentName}</td>
                <td className="border border-gray-300 px-2 py-1">{g.grade ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
