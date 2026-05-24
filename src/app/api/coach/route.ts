import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { COACH_IDENTITY } from "@/lib/coach/prompt";
import { FRAMEWORK_LIBRARY } from "@/lib/coach/frameworks";
import { buildContentBlock } from "@/lib/coach/content";
import { buildUserContext } from "@/lib/coach/context";
import {
  addMessage,
  createConversation,
  getConversation,
  listMessages,
  setConversationTitle,
} from "@/lib/coach/conversations";

const COACH_MODEL = "claude-opus-4-7";
const MAX_TOKENS = 4096;

function err(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return err("Not signed in.", 401);

  if (!process.env.ANTHROPIC_API_KEY) {
    return err(
      "The Coach isn't configured on this deployment yet. Ask Brent to set ANTHROPIC_API_KEY.",
      503,
    );
  }

  // Light rate limit — 30 coach turns per 10 minutes per IP. Generous
  // for a conversation, hard enough to block automated abuse.
  if (!(await rateLimit(`coach:${clientIp(req)}`, 30, 600))) {
    return err(
      "You're going fast. Take a breath — we can pick this up in a minute.",
      429,
    );
  }

  let body: { conversation_id?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid request.", 400);
  }

  const userMessage =
    typeof body.message === "string" ? body.message.trim() : "";
  if (!userMessage) return err("Write something first.", 400);
  if (userMessage.length > 8000) {
    return err("That's a long one — try trimming to under 8000 characters.", 400);
  }

  // Find or create the conversation.
  let conversationId =
    typeof body.conversation_id === "string" ? body.conversation_id : null;
  let conversation = conversationId
    ? await getConversation(user.id, conversationId)
    : null;
  if (!conversation) {
    conversation = await createConversation(
      user.id,
      userMessage.slice(0, 80),
    );
    conversationId = conversation.id;
  } else {
    conversationId = conversation.id;
  }

  // Load prior turns and persist the new user message.
  const priorMessages = await listMessages(conversationId);
  await addMessage(conversationId, "user", userMessage);

  // Assemble the four cached system blocks. Each gets its own
  // cache_control breakpoint so the prefix cache hits as much as
  // possible across requests. Stability ordering, most stable first:
  //   1. COACH_IDENTITY — frozen across all users, all turns.
  //   2. FRAMEWORK_LIBRARY — frozen across all users (changes only on deploy).
  //   3. Brent's content library — refreshes only when Brent edits content.
  //   4. Per-user context — refreshes when the user updates their curriculum data.
  const [contentBlock, userContext] = await Promise.all([
    buildContentBlock(),
    buildUserContext(user.id),
  ]);

  const anthropicMessages: Anthropic.MessageParam[] = [
    ...priorMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const client = new Anthropic();

  // Stream the response back as plain text chunks. The client reads with
  // ReadableStream / TextDecoder. We persist the full assistant reply
  // after the stream completes.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Always send the conversation_id as the first chunk so the client
      // can pin to a new conversation on the very first turn.
      controller.enqueue(
        encoder.encode(`__conv__${conversationId}\n`),
      );

      let assistantText = "";
      try {
        const responseStream = client.messages.stream({
          model: COACH_MODEL,
          max_tokens: MAX_TOKENS,
          // Four-block system prompt with four cache breakpoints (the
          // max). Ordered by stability — most stable first — so the
          // prefix cache hits maximally.
          system: [
            {
              type: "text",
              text: COACH_IDENTITY,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: FRAMEWORK_LIBRARY,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: contentBlock,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: userContext,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: anthropicMessages,
        });

        for await (const event of responseStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            assistantText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        const final = await responseStream.finalMessage();
        // Persist the assistant turn.
        await addMessage(conversationId, "assistant", assistantText);

        // Auto-title the conversation if it's still the placeholder
        // (first 80 chars of the first user message) — generate a short
        // human title from the first exchange.
        if (priorMessages.length === 0) {
          const title = autoTitle(userMessage, assistantText);
          if (title) {
            await setConversationTitle(user.id, conversationId, title);
          }
        }

        void final.usage; // available if we ever want to log it
      } catch (e) {
        const message =
          e instanceof Anthropic.RateLimitError
            ? "The Coach is being rate-limited by Anthropic right now. Try again in a moment."
            : e instanceof Anthropic.APIError
              ? "The Coach hit a snag connecting. Try again in a moment."
              : "Something went sideways. Try again?";
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
        console.error("[coach] stream failed:", e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": conversationId,
    },
  });
}

function autoTitle(userMessage: string, assistantText: string): string | null {
  const trimmed = userMessage.trim().split(/\s+/).slice(0, 8).join(" ");
  if (trimmed.length < 6) {
    // Fall back to the first line of the assistant's reply.
    const firstLine = assistantText.split("\n")[0]?.trim() ?? "";
    return firstLine.slice(0, 80) || null;
  }
  return trimmed.slice(0, 80);
}
