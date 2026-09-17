import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { githubAPI } from "@/lib/github-api";

// Returns the user's GitHub orgs (and personal repos context)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  try {
    const [orgs, repos] = await Promise.all([
      githubAPI.getUserOrgs(account.access_token),
      githubAPI.getUserRepos(account.access_token),
    ]);
    return NextResponse.json({ orgs, repos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
