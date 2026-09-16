"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className={`font-bold text-lg ${!sidebarOpen && "hidden"}`}>
            Nexa
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            ☰
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="text-lg">🏠</span>
            {sidebarOpen && <span>Home</span>}
          </Link>
          <Link
            href="/communities"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="text-lg">🏘️</span>
            {sidebarOpen && <span>Communities</span>}
          </Link>
          <Link
            href="/messages"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="text-lg">💬</span>
            {sidebarOpen && <span>Messages</span>}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="text-lg">⚙️</span>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
