import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const community = await prisma.community.findUnique({ where: { id: params.id } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }
  if (!community.isPublic) {
    return NextResponse.json({ error: "This community is invite-only" }, { status: 403 });
  }

  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: session.user.id, communityId: params.id } },
    create: { userId: session.user.id, communityId: params.id },
    update: {},
  });

  return NextResponse.json({ joined: true });
}
