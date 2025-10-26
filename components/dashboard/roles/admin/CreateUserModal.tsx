"use client";

import { User, Admin, Teacher, Student } from "./types";

interface CreateUserModalProps {
  data: Partial<User> & { password?: string };
  onChange: (data: Partial<User> & { password?: string }) => void;
  onClose: () => void;
  onSubmit: () => void;
  departments: string[];
  subjects: string[];
  gradeLevels: string[];
}

export default function CreateUserModal({
  data,
  onChange,
  onClose,
  onSubmit,
  departments,
  subjects,
  gradeLevels,
}: CreateUserModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Create User</h2>

        {/* Role selection */}
        <select
          value={data.role}
          onChange={(e) => {
            const newRole = e.target.value as "ADMIN" | "TEACHER" | "STUDENT";
            onChange({
              ...data,
              role: newRole,
              department: "",
              subject: "",
              gradeLevel: "",
            });
          }}
          className="w-full p-2 mb-2 border rounded bg-blue-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={data.password || ""}
          onChange={(e) => onChange({ ...data, password: e.target.value })}
          className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Common fields */}
        <input
          type="text"
          placeholder="First Name"
          value={data.firstName || ""}
          onChange={(e) => onChange({ ...data, firstName: e.target.value })}
          className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Middle Name"
          value={data.middleName || ""}
          onChange={(e) => onChange({ ...data, middleName: e.target.value })}
          className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={data.lastName || ""}
          onChange={(e) => onChange({ ...data, lastName: e.target.value })}
          className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email || ""}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Role-specific dropdowns */}
        {data.role === "ADMIN" && (
          <select
            value={(data as Admin).department || ""}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            className="w-full p-2 mb-2 border rounded bg-blue-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        )}

        {data.role === "TEACHER" && (
          <select
            value={(data as Teacher).subject || ""}
            onChange={(e) => onChange({ ...data, subject: e.target.value })}
            className="w-full p-2 mb-2 border rounded bg-blue-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        )}

        {data.role === "STUDENT" && (
          <select
            value={(data as Student).gradeLevel || ""}
            onChange={(e) => onChange({ ...data, gradeLevel: e.target.value })}
            className="w-full p-2 mb-2 border rounded bg-blue-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Grade Level</option>
            {gradeLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
