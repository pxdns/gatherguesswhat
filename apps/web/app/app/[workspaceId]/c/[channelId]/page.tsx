import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChannelView } from "@/components/chat/ChannelView";

export default async function ChannelPage({
  params,
}: {
  params: { workspaceId: string; channelId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const channel = await prisma.channel.findUnique({
    where: { id: params.channelId },
    include: {
      ws: { select: { id: true, name: true, slug: true } },
      members: { take: 50 },
      pins: {
        include: {
          message: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!channel) {
    return <div className="p-8 text-muted">Channel not found.</div>;
  }

  // Fetch initial messages (server-side for SSR)
  const messages = await prisma.message.findMany({
    where: { channelId: params.channelId, parentId: null, deletedAt: null },
    include: {
      user: { select: { id: true, name: true, image: true, githubUsername: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      attachments: true,
      replies: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        take: 3,
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  return (
    <ChannelView
      channel={channel as any}
      initialMessages={messages as any}
      pins={channel.pins as any}
      currentUserId={session.user.id}
      currentUserName={session.user.name || "You"}
      currentUserImage={session.user.image || undefined}
    />
  );
}
