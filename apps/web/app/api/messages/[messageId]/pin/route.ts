import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: params.messageId },
    select: { channelId: true },
  });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.pin.findUnique({
    where: { messageId_channelId: { messageId: params.messageId, channelId: message.channelId } },
  });

  if (existing) {
    await prisma.pin.delete({ where: { id: existing.id } });
    return NextResponse.json({ unpinned: true });
  }

  const pin = await prisma.pin.create({
    data: { messageId: params.messageId, channelId: message.channelId, pinnedBy: session.user.id },
  });

  return NextResponse.json({ pin }, { status: 201 });
}
