"use client";

import { User, Admin, Teacher, Student } from "./types";

interface EditUserModalProps {
  data: Partial<User>;
  onChange: (data: Partial<User>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditUserModal({ data, onChange, onClose, onSubmit }: EditUserModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Update User</h2>

        <input
          type="text"
          placeholder="Username"
          value={data.username || ""}
          readOnly
          className="w-full p-2 mb-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
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
          className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Role-specific fields */}
        {data.role === "ADMIN" && (
          <input
            type="text"
            placeholder="Department (optional)"
            value={(data as Admin).department || ""}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}
        {data.role === "TEACHER" && (
          <input
            type="text"
            placeholder="Subject (optional)"
            value={(data as Teacher).subject || ""}
            onChange={(e) => onChange({ ...data, subject: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}
        {data.role === "STUDENT" && (
          <input
            type="text"
            placeholder="Grade Level (optional)"
            value={(data as Student).gradeLevel || ""}
            onChange={(e) => onChange({ ...data, gradeLevel: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}

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
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
