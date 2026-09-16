"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type FilterLevel = "off" | "low" | "medium" | "strict";
type FilterAction = "allow" | "mask" | "warn" | "block";

interface Settings {
  theme: string;
  notifications: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
  profanityFilterLevel: FilterLevel;
  profanityFilterAction: FilterAction;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  async function updateSettings(patch: Partial<Settings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="p-8 max-w-2xl">
        <p className="text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        {saving && <span className="text-sm text-slate-500">Saving...</span>}
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>

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

      {/* Content Filter Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Content Filter</h2>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Profanity filter level
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Controls how much language is filtered in messages you send. Applied
              server-side so it can't be bypassed from the client.
            </p>
            <select
              value={settings.profanityFilterLevel}
              onChange={(e) =>
                updateSettings({ profanityFilterLevel: e.target.value as FilterLevel })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
            >
              <option value="off">Off — no filtering</option>
              <option value="low">Low — mild language only</option>
              <option value="medium">Medium — recommended</option>
              <option value="strict">Strict — includes slurs & hate speech</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Action</label>
            <select
              value={settings.profanityFilterAction}
              onChange={(e) =>
                updateSettings({ profanityFilterAction: e.target.value as FilterAction })
              }
              disabled={settings.profanityFilterLevel === "off"}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 disabled:opacity-50"
            >
              <option value="mask">Mask — replace with asterisks</option>
              <option value="warn">Warn — mask and flag the message</option>
              <option value="block">Block — refuse to send the message</option>
            </select>
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
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value })}
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
              checked={settings.notifications}
              onChange={(e) => updateSettings({ notifications: e.target.checked })}
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
