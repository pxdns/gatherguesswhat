import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const since = url.searchParams.get("since");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "60"), 100);

  const where: any = {
    channelId: params.channelId,
    parentId: null,
    deletedAt: null,
  };
  if (since) {
    where.createdAt = { gt: new Date(since) };
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, image: true, githubUsername: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      attachments: true,
      replies: {
        where: { deletedAt: null },
        include: { user: { select: { id: true, name: true, image: true } } },
        take: 3,
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return NextResponse.json({ messages });
}
