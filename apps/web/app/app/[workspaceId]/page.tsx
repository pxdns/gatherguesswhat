import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WorkspacePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, githubUsername: true, status: true } } },
        take: 20,
      },
      channels: {
        where: { type: "text", isArchived: false },
        take: 5,
        orderBy: { createdAt: "asc" },
      },
      taskBoards: {
        include: {
          columns: {
            include: { tasks: { take: 3, orderBy: { order: "asc" } } },
          },
        },
        take: 1,
      },
    },
  });

  if (!workspace) return <div className="p-8 text-muted">Workspace not found.</div>;

  const totalTasks = workspace.taskBoards[0]?.columns.reduce(
    (s, c) => s + c.tasks.length, 0
  ) ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Workspace header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl vertex-gradient flex items-center justify-center text-xl font-bold glow-primary">
            {workspace.icon || workspace.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {workspace.githubOrgName && (
              <p className="text-muted text-sm flex items-center gap-1.5 mt-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                {workspace.githubOrgName}
              </p>
            )}
            {workspace.description && (
              <p className="text-subtle text-sm mt-1">{workspace.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Members", value: workspace.members.length },
            { label: "Channels", value: workspace.channels.length },
            { label: "Open tasks", value: totalTasks },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold vertex-gradient-text">{s.value}</p>
              <p className="text-muted text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active members */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full status-online inline-block" />
            Team Members
          </h2>
          <div className="space-y-2">
            {workspace.members.slice(0, 8).map(({ user }) => (
              <div key={user.id} className="flex items-center gap-3">
                {user.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full vertex-gradient flex items-center justify-center text-xs font-bold">
                    {user.name?.[0] || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.name || "Unknown"}</p>
                  {user.githubUsername && (
                    <p className="text-xs text-muted truncate">@{user.githubUsername}</p>
                  )}
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 status-${user.status || "offline"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="space-y-3">
          {[
            {
              href: `/app/${params.workspaceId}/tasks`,
              icon: "✓",
              title: "Tasks",
              desc: "Kanban boards & todo lists",
              color: "from-indigo-500/20 to-purple-500/20",
            },
            {
              href: `/app/${params.workspaceId}/roadmap`,
              icon: "→",
              title: "Roadmap",
              desc: "Milestones & timelines",
              color: "from-blue-500/20 to-cyan-500/20",
            },
            {
              href: `/app/${params.workspaceId}/github`,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              ),
              title: "GitHub",
              desc: "Orgs, repos & activity",
              color: "from-gray-500/20 to-slate-500/20",
            },
            {
              href: `/app/${params.workspaceId}/ai`,
              icon: "✦",
              title: "AI Assistant",
              desc: "Claude for your workspace",
              color: "from-purple-500/20 to-pink-500/20",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-xl glass hover:bg-white/[0.06] transition-glass bg-gradient-to-r ${item.color}`}
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg shrink-0">
                {typeof item.icon === "string" ? item.icon : item.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-muted text-xs">{item.desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted ml-auto shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent channels */}
      {workspace.channels.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">Jump to a channel</h2>
          <div className="grid grid-cols-3 gap-2">
            {workspace.channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/app/${params.workspaceId}/c/${ch.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/[0.07] transition-glass text-sm"
              >
                <span className="text-muted">#</span>
                <span className="truncate text-subtle hover:text-white">{ch.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
