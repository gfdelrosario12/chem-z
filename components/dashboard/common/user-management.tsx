"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

interface BaseUser {
  id: number | null; // allow null to match backend inconsistency
  username: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  firstName: string;
  middleName?: string;
  lastName: string;
}

interface Admin extends BaseUser {
  department?: string;
}

interface Teacher extends BaseUser {
  subject?: string;
}

interface Student extends BaseUser {
  gradeLevel?: string;
}

type User = Admin | Teacher | Student;

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState<
    Partial<User> & { password?: string }
  >({
    role: "STUDENT",
    password: "",
  });

  interface UserFormModalProps {
    mode: "create" | "edit";
    data: Partial<User> & { password?: string };
    onChange: (data: Partial<User> & { password?: string }) => void;
    onClose: () => void;
    onSubmit: () => void;
  }

  function UserFormModal({ mode, data, onChange, onClose, onSubmit }: UserFormModalProps) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-blue-600">
            {mode === "create" ? "Create User" : "Update User"}
          </h2>

          {/* Role select (only when creating) */}
          {mode === "create" && (
            <select
              value={data.role}
              onChange={(e) => onChange({ ...data, role: e.target.value as any })}
              className="w-full p-2 mb-2 border rounded bg-blue-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          )}

          {/* Username (only for editing) */}
          {mode === "edit" && (
            <input
              type="text"
              placeholder="Username"
              value={data.username || ""}
              readOnly
              className="w-full p-2 mb-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          )}

          {/* Password (only for creating) */}
          {mode === "create" && (
            <input
              type="password"
              placeholder="Password"
              value={data.password || ""}
              onChange={(e) => onChange({ ...data, password: e.target.value })}
              className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          )}

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
              {mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetch(`${API_BASE}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          // Debug: log any users with missing IDs
          data.forEach((u) => {
            if (!u.id) console.warn("User with missing ID:", u);
          });
        } else {
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number | null) => {
    if (!id) {
      alert("Invalid user ID ❌");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
      else alert("Failed to delete user ❌");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
  };

  const handleUpdate = async () => {
    if (!editingUser || !editingUser.id) return;

    try {
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        setEditingUser(null);
      } else {
        const errText = await res.text();
        alert("Failed to update user ❌\n" + errText);
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleCreate = async () => {
    const { email, password, firstName, lastName } = newUserData;

    if (!email || !password || !firstName || !lastName) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUserData),
      });

      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
        setShowCreateModal(false);
        setNewUserData({ role: "STUDENT", password: "" });
      } else {
        const errText = await res.text();
        alert("Failed to create user ❌\n" + errText);
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-lg text-blue-500 animate-pulse">
        Loading users...
      </div>
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-700 bg-clip-text text-transparent">
          User Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
        >
          + Create User
        </button>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 border-b text-left">ID</th>
                <th className="px-4 py-3 border-b text-left">Username</th>
                <th className="px-4 py-3 border-b text-left">Name</th>
                <th className="px-4 py-3 border-b text-left">Email</th>
                <th className="px-4 py-3 border-b text-left">Role</th>
                <th className="px-4 py-3 border-b text-left">Others</th>
                <th className="px-4 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {users.map((user, index) => (
                <tr
                  key={user.id ?? `${user.username}-${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 border-b">{user.id ?? "N/A"}</td>
                  <td className="px-4 py-3 border-b font-medium">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {user.firstName}{" "}
                    {user.middleName ? `${user.middleName} ` : ""}
                    {user.lastName}
                  </td>
                  <td className="px-4 py-3 border-b">{user.email}</td>
                  <td className="px-4 py-3 border-b font-semibold">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                        : user.role === "TEACHER"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200"
                          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b">
                    {user.role === "ADMIN" && (user as Admin).department}
                    {user.role === "TEACHER" && (user as Teacher).subject}
                    {user.role === "STUDENT" && (user as Student).gradeLevel}
                  </td>
                  <td className="px-4 py-3 border-b space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 text-white font-medium shadow-md hover:from-blue-800 hover:to-blue-950 transition-all duration-200"
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

      {/* Create Modal */}
      {showCreateModal && (
        <UserFormModal
          mode="create"
          data={newUserData}
          onChange={setNewUserData}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <UserFormModal
          mode="edit"
          data={formData}
          onChange={setFormData}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}

    </div>
  );
}
