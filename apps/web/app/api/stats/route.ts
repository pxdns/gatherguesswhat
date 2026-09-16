import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [communityCount, messageCount] = await Promise.all([
    prisma.communityMember.count({ where: { userId: session.user.id } }),
    prisma.message.count({ where: { userId: session.user.id, deletedAt: null } }),
  ]);

  return NextResponse.json({ communityCount, messageCount });
}
