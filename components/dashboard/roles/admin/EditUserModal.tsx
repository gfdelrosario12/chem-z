"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { User, Admin, Teacher, Student } from "./types";

interface EditUserModalProps {
  data: Partial<User>;
  onChange: (data: Partial<User>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditUserModal({
  data,
  onChange,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const handlePasswordChange = async () => {
    if (!data.id) return alert("Missing user ID!");
    try {
      const res = await fetch(`${API_BASE}/users/${data.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(result.message || "Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        setMessage(result.error || "Failed to change password.");
      }
    } catch {
      setMessage("Server error while changing password.");
    }
  };

  const handleInfoUpdate = async () => {
    if (!data.id) return alert("Missing user ID!");

    try {
      const res = await fetch(`${API_BASE}/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("🔹 Backend returned:", result); // ✅ log full backend response

      if (res.ok) {
        setMessage(result.message || "User info updated successfully ✅");
        onSubmit(); // refresh user list
      } else {
        setMessage(result.error || "Failed to update user ❌");
      }
    } catch (error) {
      console.error("❌ Error updating user:", error);
      setMessage("Server error while updating user ❌");
    }
  };

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
            placeholder="Department"
            value={(data as Admin).department || ""}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}
        {data.role === "TEACHER" && (
          <input
            type="text"
            placeholder="Subject"
            value={(data as Teacher).subject || ""}
            onChange={(e) => onChange({ ...data, subject: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}
        {data.role === "STUDENT" && (
          <input
            type="text"
            placeholder="Grade Level"
            value={(data as Student).gradeLevel || ""}
            onChange={(e) => onChange({ ...data, gradeLevel: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Password change section */}
        <hr className="my-3" />
        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Change Password
        </h3>

        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {message && (
          <p className="text-sm text-center text-blue-600 dark:text-blue-400 mb-2">
            {message}
          </p>
        )}

        <div className="flex justify-between space-x-2 mt-4">
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Change Password
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleInfoUpdate}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Update Info
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
