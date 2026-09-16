import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_LEVELS = ["off", "low", "medium", "strict"];
const VALID_ACTIONS = ["allow", "mask", "warn", "block"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.theme !== undefined) data.theme = String(body.theme);
  if (body.notifications !== undefined) data.notifications = Boolean(body.notifications);
  if (body.soundEnabled !== undefined) data.soundEnabled = Boolean(body.soundEnabled);
  if (body.compactMode !== undefined) data.compactMode = Boolean(body.compactMode);

  if (body.profanityFilterLevel !== undefined) {
    if (!VALID_LEVELS.includes(body.profanityFilterLevel)) {
      return NextResponse.json({ error: "Invalid filter level" }, { status: 400 });
    }
    data.profanityFilterLevel = body.profanityFilterLevel;
  }

  if (body.profanityFilterAction !== undefined) {
    if (!VALID_ACTIONS.includes(body.profanityFilterAction)) {
      return NextResponse.json({ error: "Invalid filter action" }, { status: 400 });
    }
    data.profanityFilterAction = body.profanityFilterAction;
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
