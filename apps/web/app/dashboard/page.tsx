"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { brand } from "@nexa/branding";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {session?.user?.name || "User"}!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You're now signed into {brand.name}. This is your dashboard.
          </p>
        </div>

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Name
                </p>
                <p className="font-medium">{session?.user?.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Authentication configured</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Database connected</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-400">→</span>
                <span>Create your first community</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-400">→</span>
                <span>Invite friends</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
