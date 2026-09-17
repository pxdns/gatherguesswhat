import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      description: true,
      githubOrgName: true,
      githubOrgId: true,
      _count: { select: { members: true } },
    },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check membership
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const channels = await prisma.channel.findMany({
    where: { workspaceId: workspace.id, isArchived: false },
    select: {
      id: true,
      name: true,
      type: true,
      isPrivate: true,
      isDm: true,
      githubRepoName: true,
      githubRepoOwner: true,
      description: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ workspace, channels });
}

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({ where: { slug: params.slug } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } },
  });
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      name: body.name,
      icon: body.icon,
      description: body.description,
      githubOrgName: body.githubOrgName,
    },
  });

  return NextResponse.json({ workspace: updated });
}
