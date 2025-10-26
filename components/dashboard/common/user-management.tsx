"use client";

import { useEffect, useState } from "react";
import { User, Admin, Teacher, Student } from "../roles/admin/types";
import CreateUserModal from "../roles/admin/CreateUserModal";
import EditUserModal from "../roles/admin/EditUserModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<User> & { password?: string }>({
    role: "STUDENT",
    password: "",
  });

  // Dropdown options
  const departments = ["Computer Science", "Engineering", "Business"];
  const subjects = ["Mathematics", "Science", "English", "ICT"];
  const gradeLevels = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  // Fetch all users
  useEffect(() => {
    fetch(`${API_BASE}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Handle delete user
  const handleDelete = async (id: number | null) => {
    if (!id || !confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Failed to delete user ❌");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
  };

  // Handle update
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
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setEditingUser(null);
      } else {
        alert("Failed to update user ❌");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle create
  const handleCreate = async () => {
    const { email, password, firstName, lastName } = newUserData;
    if (!email || !password || !firstName || !lastName) {
      alert("Please fill out all required fields");
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
        alert("✅ User created successfully!");
      } else {
        const errText = await res.text();
        alert("Failed to create user ❌\n" + errText);
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating user ❌");
    }
  };

  // Loading state
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
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 text-white font-medium shadow-md hover:from-sky-600 hover:to-blue-800 transition-all duration-200"
        >
          + Create User
        </button>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 border-b text-left">Details</th>
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
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "ADMIN"
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

      {/* ✅ Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          data={newUserData}
          onChange={setNewUserData}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          departments={departments}
          subjects={subjects}
          gradeLevels={gradeLevels}
        />
      )}

      {/* ✏️ Edit User Modal */}
      {editingUser && (
        <EditUserModal
          data={formData}
          onChange={setFormData}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
          departments={departments}
          subjects={subjects}
          gradeLevels={gradeLevels}
        />
      )}
    </div>
  );
}
