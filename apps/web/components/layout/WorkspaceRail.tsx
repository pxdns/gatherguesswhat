"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  githubOrgName: string | null;
}

interface Props {
  session: Session;
}

export function WorkspaceRail({ session }: Props) {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((d) => setWorkspaces(d.workspaces || []))
      .catch(() => null);
  }, []);

  return (
    <div
      className="flex flex-col items-center py-3 gap-2 glass-sidebar border-r border-white/[0.06] shrink-0"
      style={{ width: 56 }}
    >
      {/* Vertex logo */}
      <Link
        href="/app"
        className="w-9 h-9 rounded-xl vertex-gradient flex items-center justify-center mb-1 glow-primary shrink-0"
        data-tooltip="Vertex"
      >
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L20 19H2L11 2Z" fill="white" fillOpacity="0.9" />
          <circle cx="11" cy="13" r="2.5" fill="white" fillOpacity="0.5" />
        </svg>
      </Link>

      <div className="w-6 h-px bg-white/[0.08] my-1" />

      {/* Workspace avatars */}
      {workspaces.map((ws) => {
        const isActive = pathname.startsWith(`/app/${ws.slug}`);
        const initial = ws.name[0].toUpperCase();
        return (
          <Link
            key={ws.id}
            href={`/app/${ws.slug}`}
            data-tooltip={ws.name}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold
              transition-glass shrink-0
              ${isActive
                ? "vertex-gradient text-white glow-primary"
                : "glass text-subtle hover:text-white hover:bg-white/[0.08]"
              }
            `}
          >
            {ws.icon ? (
              <span className="text-base">{ws.icon}</span>
            ) : (
              initial
            )}
          </Link>
        );
      })}

      {/* Create workspace */}
      <button
        className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-white hover:bg-white/[0.08] transition-glass shrink-0"
        data-tooltip="Create workspace"
        onClick={() => {
          const name = prompt("Workspace name:");
          if (name) {
            fetch("/api/workspaces", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.workspace) {
                  setWorkspaces((p) => [...p, d.workspace]);
                  window.location.href = `/app/${d.workspace.slug}`;
                }
              });
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Settings / User */}
      <button
        className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-white hover:bg-white/[0.08] transition-glass shrink-0"
        data-tooltip="Sign out"
        onClick={() => signOut({ callbackUrl: "/signin" })}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-full h-full rounded-xl object-cover"
          />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>
    </div>
  );
}
