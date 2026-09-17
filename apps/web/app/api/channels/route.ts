import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, name, type = "text", description, isPrivate, githubRepoName, githubRepoOwner } =
    await req.json();

  if (!workspaceId || !name?.trim()) {
    return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
  }

  // Verify membership
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const channel = await prisma.channel.create({
    data: {
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      type,
      description,
      isPrivate: isPrivate ?? false,
      workspaceId,
      githubRepoName,
      githubRepoOwner,
    },
    select: {
      id: true,
      name: true,
      type: true,
      isPrivate: true,
      isDm: true,
      githubRepoName: true,
      description: true,
    },
  });

  return NextResponse.json({ channel }, { status: 201 });
}
