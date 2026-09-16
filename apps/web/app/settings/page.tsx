"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Account</h2>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={session?.user?.name || ""}
              disabled
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Appearance</h2>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block font-medium">Enable notifications</label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get notified about messages and updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4">
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Sign Out
          </button>
          <button className="w-full px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg font-semibold transition">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
