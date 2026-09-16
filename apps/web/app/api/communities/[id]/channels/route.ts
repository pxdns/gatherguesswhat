import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: params.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this community" }, { status: 403 });
  }

  const channels = await prisma.channel.findMany({
    where: { communityId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(channels);
}
