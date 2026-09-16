import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communities = await prisma.community.findMany({
    where: {
      OR: [{ isPublic: true }, { members: { some: { userId: session.user.id } } }],
    },
    include: {
      _count: { select: { members: true } },
      members: { where: { userId: session.user.id }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      isPublic: c.isPublic,
      memberCount: c._count.members,
      isMember: c.members.length > 0,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const community = await prisma.community.create({
    data: {
      name: name.trim().slice(0, 100),
      description: typeof description === "string" ? description.slice(0, 500) : null,
      members: { create: { userId: session.user.id } },
      channels: { create: { name: "general", type: "text" } },
    },
    include: { _count: { select: { members: true } } },
  });

  return NextResponse.json({
    id: community.id,
    name: community.name,
    description: community.description,
    icon: community.icon,
    isPublic: community.isPublic,
    memberCount: community._count.members,
    isMember: true,
  });
}
