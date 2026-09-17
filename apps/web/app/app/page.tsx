import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  // Find or create user's first workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  if (membership) {
    redirect(`/app/${membership.workspace.slug}`);
  }

  // First-time user: create a personal workspace
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, githubUsername: true },
  });

  const slug = (user?.githubUsername || user?.name || "my-workspace")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);

  const workspace = await prisma.workspace.create({
    data: {
      name: user?.name ? `${user.name}'s Workspace` : "My Workspace",
      slug: `${slug}-${Date.now().toString(36)}`,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
      channels: {
        create: [
          { name: "general", type: "text", description: "General discussion" },
          { name: "announcements", type: "announcement", description: "Important updates" },
          { name: "random", type: "text", description: "Off-topic chat" },
        ],
      },
      taskBoards: {
        create: {
          name: "Main Board",
          columns: {
            create: [
              { name: "Backlog", order: 0, color: "#6b7280" },
              { name: "In Progress", order: 1, color: "#6366f1" },
              { name: "In Review", order: 2, color: "#f59e0b" },
              { name: "Done", order: 3, color: "#22c55e" },
            ],
          },
        },
      },
      roadmaps: {
        create: {
          name: "Product Roadmap",
          description: "High-level milestones and goals",
        },
      },
    },
  });

  redirect(`/app/${workspace.slug}`);
}
