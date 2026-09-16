import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterMessage, type FilterAction, type FilterLevel } from "@nexa/moderation";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content must be a string" }, { status: 400 });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const result = filterMessage(
    content,
    settings.profanityFilterLevel as FilterLevel,
    settings.profanityFilterAction as FilterAction
  );

  if (result.blocked) {
    return NextResponse.json(
      { error: "Message blocked by content filter", matched: result.matched },
      { status: 422 }
    );
  }

  return NextResponse.json(result);
}
