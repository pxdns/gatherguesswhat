import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("workspaceSlug");
  if (!slug) return NextResponse.json({ error: "workspaceSlug required" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const roadmaps = await prisma.roadmap.findMany({
    where: { workspaceId: workspace.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ roadmaps });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "add-milestone") {
    const { roadmapId, title, description, startDate, dueDate, color } = body;
    const last = await prisma.milestone.findFirst({
      where: { roadmapId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        roadmapId,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        color: color || "#6366f1",
        order: (last?.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ milestone }, { status: 201 });
  }

  if (body.action === "update-milestone") {
    const { milestoneId, ...updates } = body;
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        color: updates.color,
      },
    });
    return NextResponse.json({ milestone });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
