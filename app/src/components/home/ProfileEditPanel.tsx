"use client";
import { useState } from "react";

export default function ProfileEditPanel() {
  const [form, setForm] = useState({
    fullName: "Drew Anderson",
    email: "drew@geovera.xyz",
    role: "Brand Owner",
    phone: "+62 812 3456 7890",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <h3
        className="text-base font-semibold text-gray-900 dark:text-white mb-5"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Edit Profile
      </h3>

      <div className="flex-1 space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold text-lg dark:bg-gray-700 dark:text-gray-300">
            DA
          </div>
          <button className="text-xs text-brand-500 hover:text-brand-600 font-medium">
            Change photo
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
        <button className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
