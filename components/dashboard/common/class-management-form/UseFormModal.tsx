"use client";

import React from "react";

interface UserFormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel?: string;
}

export function UserFormModal({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
}: UserFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[28rem] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600">{title}</h2>
        {children}
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
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
