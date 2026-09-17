import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Vertex AI — the built-in assistant for the Vertex workplace collaboration platform. You help engineering teams with:

- Code review, debugging, and architecture questions
- Writing and editing documentation
- Summarizing GitHub activity and pull requests
- Creating task descriptions and acceptance criteria
- Planning roadmap milestones
- Answering questions about the team's codebase and projects

You have context about the user's workspace. Be concise, direct, and technical. Format code with markdown code blocks. When you give advice, lead with the recommendation.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, conversationId, workspaceContext } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  // Load or create conversation
  let convo = conversationId
    ? await prisma.aIConversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
      })
    : null;

  if (!convo) {
    convo = await prisma.aIConversation.create({
      data: {
        userId: session.user.id,
        context: workspaceContext,
        title: message.slice(0, 60),
      },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.aIMessage.create({
    data: { conversationId: convo.id, role: "user", content: message },
  });

  // Build message history for Claude
  const history: Anthropic.MessageParam[] = convo.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: message });

  // Stream from Claude
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: "claude-opus-5",
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          system: SYSTEM_PROMPT,
          messages: history,
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullResponse += chunk.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }

        // Save assistant response
        await prisma.aIMessage.create({
          data: {
            conversationId: convo!.id,
            role: "assistant",
            content: fullResponse,
          },
        });

        // Update conversation title if first response
        if (convo!.messages.length === 0) {
          await prisma.aIConversation.update({
            where: { id: convo!.id },
            data: { title: message.slice(0, 80) },
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, conversationId: convo!.id })}\n\n`
          )
        );
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.aIConversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, title: true, updatedAt: true, model: true },
  });

  return NextResponse.json({ conversations });
}
