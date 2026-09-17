"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { WorkspaceRail } from "./WorkspaceRail";
import { Sidebar } from "./Sidebar";

interface Props {
  children: React.ReactNode;
  session: Session;
}

export function AppShell({ children, session }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell relative z-10">
      {/* Workspace Rail — leftmost column, always visible */}
      <WorkspaceRail session={session} />

      {/* Sidebar — channels, dms, nav */}
      {sidebarOpen && <Sidebar session={session} />}

      {/* Main content */}
      <main
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Top bar */}
        <div className="h-12 glass-sidebar flex items-center px-4 gap-3 shrink-0 border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass"
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1" />
          {/* User avatar */}
          <div className="flex items-center gap-2">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-7 h-7 rounded-full ring-1 ring-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full vertex-gradient flex items-center justify-center text-xs font-bold">
                {session.user?.name?.[0] || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
