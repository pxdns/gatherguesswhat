import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true, icon: true, githubOrgName: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({
    workspaces: memberships.map((m) => m.workspace),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, description, githubOrgName } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  const slug = `${base}-${Date.now().toString(36)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug,
      icon,
      description,
      githubOrgName,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
      channels: {
        create: [
          { name: "general", type: "text", description: "General discussion" },
          { name: "announcements", type: "announcement", description: "Important updates" },
        ],
      },
      taskBoards: {
        create: {
          name: "Main Board",
          columns: {
            create: [
              { name: "Backlog", order: 0, color: "#6b7280" },
              { name: "In Progress", order: 1, color: "#6366f1" },
              { name: "In Review", order: 2, color: "#f59e0b" },
              { name: "Done", order: 3, color: "#22c55e" },
            ],
          },
        },
      },
      roadmaps: {
        create: { name: "Product Roadmap" },
      },
    },
    select: { id: true, name: true, slug: true, icon: true, githubOrgName: true },
  });

  return NextResponse.json({ workspace }, { status: 201 });
}
