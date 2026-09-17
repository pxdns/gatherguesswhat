import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { githubAPI } from "@/lib/github-api";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const org = url.searchParams.get("org");
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  try {
    if (org) {
      const [repos, members] = await Promise.all([
        githubAPI.getOrgRepos(account.access_token, org),
        githubAPI.getOrgMembers(account.access_token, org),
      ]);
      return NextResponse.json({ repos, members });
    }

    if (owner && repo) {
      const [prs, issues, events] = await Promise.all([
        githubAPI.getRepoPRs(account.access_token, owner, repo),
        githubAPI.getRepoIssues(account.access_token, owner, repo),
        githubAPI.getRepoEvents(account.access_token, owner, repo),
      ]);
      return NextResponse.json({ prs, issues, events });
    }

    return NextResponse.json({ error: "org or owner+repo required" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
