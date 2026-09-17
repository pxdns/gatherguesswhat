"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

interface Channel {
  id: string;
  name: string;
  type: string;
  isPrivate: boolean;
  githubRepoName: string | null;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  githubOrgName: string | null;
  _count?: { members: number };
}

interface Props {
  session: Session;
}

const NAV_SECTIONS = [
  {
    key: "tasks",
    label: "Tasks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    key: "roadmap",
    label: "Roadmap",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    key: "ai",
    label: "AI Assistant",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 8v4l3 3" />
        <circle cx="19" cy="5" r="3" />
      </svg>
    ),
  },
];

export function Sidebar({ session }: Props) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.workspaceId as string | undefined;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workspaces/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setWorkspace(d.workspace);
        setChannels(d.channels || []);
      })
      .catch(() => null);
  }, [slug]);

  const createChannel = async () => {
    if (!newChannelName.trim() || !workspace) return;
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id, name: newChannelName.trim() }),
    });
    const d = await res.json();
    if (d.channel) {
      setChannels((p) => [...p, d.channel]);
      setNewChannelName("");
      setShowNewChannel(false);
    }
  };

  const textChannels = channels.filter((c) => c.type === "text" && !c.isDm);
  const repoChannels = channels.filter((c) => c.type === "github-repo");
  const announcementChannels = channels.filter((c) => c.type === "announcement");

  return (
    <div
      className="flex flex-col glass-sidebar border-r border-white/[0.06] shrink-0 overflow-hidden"
      style={{ width: 240 }}
    >
      {/* Workspace header */}
      <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-glass">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{workspace?.name || "Vertex"}</p>
            {workspace?.githubOrgName && (
              <p className="text-xs text-muted truncate">@{workspace.githubOrgName}</p>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Nav sections */}
        <div className="px-2 mb-3">
          {NAV_SECTIONS.map((section) => {
            const href = slug ? `/app/${slug}/${section.key}` : "#";
            const isActive = pathname === href;
            return (
              <Link
                key={section.key}
                href={href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm mb-0.5 transition-glass
                  ${isActive
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-subtle hover:text-white hover:bg-white/[0.05]"
                  }`}
              >
                <span className={isActive ? "text-indigo-400" : "text-muted"}>
                  {section.icon}
                </span>
                {section.label}
              </Link>
            );
          })}
        </div>

        <div className="h-px bg-white/[0.06] mx-3 mb-3" />

        {/* Announcements */}
        {announcementChannels.length > 0 && (
          <ChannelSection
            title="Announcements"
            channels={announcementChannels}
            slug={slug}
            pathname={pathname}
          />
        )}

        {/* Text channels */}
        <ChannelSection
          title="Channels"
          channels={textChannels}
          slug={slug}
          pathname={pathname}
          onAdd={() => setShowNewChannel(true)}
        />

        {showNewChannel && (
          <div className="px-3 mb-2">
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createChannel();
                if (e.key === "Escape") { setShowNewChannel(false); setNewChannelName(""); }
              }}
              placeholder="channel-name"
              className="w-full px-2 py-1.5 rounded-lg glass-input text-sm"
            />
          </div>
        )}

        {/* Repo channels */}
        {repoChannels.length > 0 && (
          <ChannelSection
            title="Repositories"
            channels={repoChannels}
            slug={slug}
            pathname={pathname}
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            }
          />
        )}

        {/* Direct Messages */}
        <div className="px-3 mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 px-2">
            Direct Messages
          </p>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-subtle hover:text-white hover:bg-white/[0.05] transition-glass">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New message
          </button>
        </div>
      </div>

      {/* User status bar */}
      <div className="px-3 py-2 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-glass">
          <div className="relative">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full vertex-gradient flex items-center justify-center text-xs font-bold">
                {session.user?.name?.[0] || "?"}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-online ring-2 ring-[#080810]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session.user?.name || "You"}</p>
            <p className="text-[10px] text-muted truncate">Online</p>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ChannelSection({
  title,
  channels,
  slug,
  pathname,
  onAdd,
  icon,
}: {
  title: string;
  channels: Channel[];
  slug: string | undefined;
  pathname: string;
  onAdd?: () => void;
  icon?: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="px-3 mb-2">
      <div className="flex items-center gap-1 mb-1">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center gap-1 flex-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-white transition-colors"
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {title}
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-0.5 rounded text-muted hover:text-white transition-colors"
            aria-label="Add channel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {!collapsed && channels.map((ch) => {
        const href = slug ? `/app/${slug}/c/${ch.id}` : "#";
        const isActive = pathname === href;
        return (
          <Link
            key={ch.id}
            href={href}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-glass
              ${isActive
                ? "bg-indigo-500/15 text-white"
                : "text-subtle hover:text-white hover:bg-white/[0.05]"
              }`}
          >
            <span className="text-muted text-xs shrink-0">
              {icon || (ch.type === "announcement" ? "📢" : ch.isPrivate ? "🔒" : "#")}
            </span>
            <span className="truncate">{ch.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
