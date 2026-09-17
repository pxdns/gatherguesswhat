import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { emoji } = await req.json();
  if (!emoji) return NextResponse.json({ error: "emoji required" }, { status: 400 });

  // Toggle reaction
  const existing = await prisma.reaction.findUnique({
    where: { userId_messageId_emoji: { userId: session.user.id, messageId: params.messageId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ removed: true });
  }

  const reaction = await prisma.reaction.create({
    data: { emoji, userId: session.user.id, messageId: params.messageId },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ reaction }, { status: 201 });
}
