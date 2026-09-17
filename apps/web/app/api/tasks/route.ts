import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const boards = await prisma.taskBoard.findMany({
    where: { workspaceId },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: { select: { id: true, name: true, image: true } },
              creator: { select: { id: true, name: true, image: true } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ boards });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "create-task") {
    const { columnId, title, description, priority, assigneeId, dueDate, labels } = body;
    if (!columnId || !title) return NextResponse.json({ error: "columnId and title required" }, { status: 400 });

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        columnId,
        assigneeId,
        creatorId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        labels: labels || [],
        order: (lastTask?.order ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  }

  if (action === "move-task") {
    const { taskId, columnId, order } = body;
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { columnId, order },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json({ task });
  }

  if (action === "update-task") {
    const { taskId, ...updates } = body;
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        assigneeId: updates.assigneeId,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        labels: updates.labels,
        completedAt: updates.completedAt ? new Date(updates.completedAt) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json({ task });
  }

  if (action === "delete-task") {
    await prisma.task.delete({ where: { id: body.taskId } });
    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
