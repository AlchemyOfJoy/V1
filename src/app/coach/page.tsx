import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getConversation,
  listConversations,
  listMessages,
} from "@/lib/coach/conversations";
import CoachChat from "@/components/coach/CoachChat";

export const metadata: Metadata = {
  title: "Companion",
  robots: { index: false },
};

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { c } = await searchParams;
  const conversations = await listConversations(user.id);

  let initialConversationId: string | null = null;
  let initialMessages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[] = [];

  if (c) {
    const conv = await getConversation(user.id, c);
    if (conv) {
      initialConversationId = conv.id;
      const msgs = await listMessages(conv.id);
      initialMessages = msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
    }
  }

  const summaries = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    last_message_at:
      c.last_message_at instanceof Date
        ? c.last_message_at.toISOString()
        : c.last_message_at,
  }));

  return (
    <CoachChat
      initialConversationId={initialConversationId}
      initialMessages={initialMessages}
      initialConversations={summaries}
    />
  );
}
