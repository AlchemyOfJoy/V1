import { randomUUID } from "crypto";
import { query } from "@/lib/db";

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string | Date;
  last_message_at: string | Date;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string | Date;
}

export async function listConversations(
  userId: string,
): Promise<ChatConversation[]> {
  return query<ChatConversation>(
    `SELECT id, user_id, title, created_at, last_message_at
       FROM chat_conversations WHERE user_id = $1
       ORDER BY last_message_at DESC LIMIT 50`,
    [userId],
  );
}

export async function createConversation(
  userId: string,
  title: string | null = null,
): Promise<ChatConversation> {
  const id = randomUUID();
  const rows = await query<ChatConversation>(
    `INSERT INTO chat_conversations (id, user_id, title)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, title, created_at, last_message_at`,
    [id, userId, title],
  );
  return rows[0];
}

export async function getConversation(
  userId: string,
  conversationId: string,
): Promise<ChatConversation | null> {
  const rows = await query<ChatConversation>(
    `SELECT id, user_id, title, created_at, last_message_at
       FROM chat_conversations WHERE user_id = $1 AND id = $2`,
    [userId, conversationId],
  );
  return rows[0] ?? null;
}

export async function listMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  return query<ChatMessage>(
    `SELECT id::text AS id, conversation_id, role, content, created_at
       FROM chat_messages WHERE conversation_id = $1
       ORDER BY id ASC LIMIT 200`,
    [conversationId],
  );
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<ChatMessage> {
  const rows = await query<ChatMessage>(
    `INSERT INTO chat_messages (conversation_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id::text AS id, conversation_id, role, content, created_at`,
    [conversationId, role, content],
  );
  await query(
    `UPDATE chat_conversations SET last_message_at = now() WHERE id = $1`,
    [conversationId],
  );
  return rows[0];
}

export async function deleteConversation(
  userId: string,
  id: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM chat_conversations WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id],
  );
  return rows.length > 0;
}

export async function setConversationTitle(
  userId: string,
  id: string,
  title: string,
): Promise<void> {
  await query(
    `UPDATE chat_conversations SET title = $1 WHERE user_id = $2 AND id = $3`,
    [title.slice(0, 120), userId, id],
  );
}
