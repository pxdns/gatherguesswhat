import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME = new Set([
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "application/pdf", "text/plain", "application/zip",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let channelId: string;
  let content: string;
  let parentId: string | undefined;
  const savedAttachments: { url: string; filename: string; size: number; mimeType: string }[] = [];

  const ct = req.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    channelId = form.get("channelId") as string;
    content = (form.get("content") as string) || "";
    parentId = (form.get("parentId") as string) || undefined;

    const files = form.getAll("files") as File[];
    for (const file of files.slice(0, 5)) {
      if (!ALLOWED_MIME.has(file.type)) continue;
      if (file.size > MAX_SIZE) continue;

      const ext = file.name.split(".").pop() || "bin";
      const name = `${randomUUID()}.${ext}`;
      const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(uploadDir, name), buffer);
      savedAttachments.push({
        url: `/uploads/${name}`,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }
  } else {
    const body = await req.json();
    channelId = body.channelId;
    content = body.content || "";
    parentId = body.parentId;
  }

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });
  if (!content.trim() && savedAttachments.length === 0) {
    return NextResponse.json({ error: "content or attachment required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      channelId,
      parentId: parentId || null,
      attachments: savedAttachments.length > 0
        ? { create: savedAttachments }
        : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true, githubUsername: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      attachments: true,
      replies: {
        include: { user: { select: { id: true, name: true, image: true } } },
        take: 3,
      },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
