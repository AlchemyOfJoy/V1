import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { QUOTES_BY_ID } from "@/lib/quotes";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const rows = await query<{ quote_id: string; created_at: string | Date }>(
    `SELECT quote_id, created_at FROM quote_favorites
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [user.id],
  );
  return NextResponse.json({ favorites: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { quote_id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const quoteId = typeof body.quote_id === "string" ? body.quote_id : "";
  if (!quoteId || !QUOTES_BY_ID.has(quoteId)) {
    return NextResponse.json({ error: "Unknown quote." }, { status: 400 });
  }
  const action = body.action === "remove" ? "remove" : "add";

  try {
    if (action === "remove") {
      await query(
        `DELETE FROM quote_favorites WHERE user_id = $1 AND quote_id = $2`,
        [user.id, quoteId],
      );
    } else {
      await query(
        `INSERT INTO quote_favorites (user_id, quote_id) VALUES ($1, $2)
         ON CONFLICT (user_id, quote_id) DO NOTHING`,
        [user.id, quoteId],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quote-favorites] failed:", err);
    return NextResponse.json(
      { error: "Couldn't update favorite." },
      { status: 500 },
    );
  }
}
