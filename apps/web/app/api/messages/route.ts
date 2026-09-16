import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterMessage, type FilterAction, type FilterLevel } from "@nexa/moderation";

async function assertMembership(userId: string, channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { communityId: true },
  });
  if (!channel) return { ok: false as const, status: 404, error: "Channel not found" };

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId: channel.communityId } },
  });
  if (!membership) {
    return { ok: false as const, status: 403, error: "Not a member of this community" };
  }
  return { ok: true as const };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channelId = new URL(req.url).searchParams.get("channelId");
  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  const check = await assertMembership(session.user.id, channelId);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const messages = await prisma.message.findMany({
    where: { channelId, deletedAt: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelId, content, attachment } = await req.json();
  if (typeof channelId !== "string") {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }
  const trimmedContent = typeof content === "string" ? content.trim() : "";
  if (!trimmedContent && !attachment) {
    return NextResponse.json({ error: "Message must have content or an attachment" }, { status: 400 });
  }

  const check = await assertMembership(session.user.id, channelId);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let finalContent = trimmedContent;
  if (trimmedContent) {
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    const result = filterMessage(
      trimmedContent,
      settings.profanityFilterLevel as FilterLevel,
      settings.profanityFilterAction as FilterAction
    );

    if (result.blocked) {
      return NextResponse.json(
        { error: "Message blocked by your content filter settings" },
        { status: 422 }
      );
    }
    finalContent = result.content;
  }

  const message = await prisma.message.create({
    data: {
      content: finalContent,
      userId: session.user.id,
      channelId,
      attachments: attachment
        ? {
            create: {
              url: attachment.url,
              filename: attachment.filename,
              size: attachment.size,
              type: attachment.type,
            },
          }
        : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      attachments: true,
    },
  });

  return NextResponse.json(message);
}
