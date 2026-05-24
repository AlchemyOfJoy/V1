import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import {
  deleteCourse,
  getCourseWithCurriculum,
  updateCourse,
} from "@/lib/courses";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  const course = await getCourseWithCurriculum(id);
  if (!course)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const patch: Parameters<typeof updateCourse>[1] = {};
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
  if (typeof body.slug === "string")
    patch.slug = body.slug.trim().toLowerCase().slice(0, 80);
  if (body.subtitle !== undefined && (typeof body.subtitle === "string" || body.subtitle === null))
    patch.subtitle = body.subtitle as string | null;
  if (body.description !== undefined && (typeof body.description === "string" || body.description === null))
    patch.description = body.description as string | null;
  if (body.cover_image_url !== undefined && (typeof body.cover_image_url === "string" || body.cover_image_url === null))
    patch.cover_image_url = body.cover_image_url as string | null;
  if (typeof body.course_type === "string") {
    if (body.course_type === "standard" || body.course_type === "certification") {
      patch.course_type = body.course_type;
    }
  }
  if (typeof body.pricing_model === "string") {
    if (
      body.pricing_model === "free" ||
      body.pricing_model === "tier_included" ||
      body.pricing_model === "paid_one_time" ||
      body.pricing_model === "paid_subscription"
    ) {
      patch.pricing_model = body.pricing_model;
    }
  }
  if (typeof body.price_cents === "number") patch.price_cents = body.price_cents;
  if (typeof body.drip_mode === "string") {
    if (
      body.drip_mode === "open" ||
      body.drip_mode === "time" ||
      body.drip_mode === "completion" ||
      body.drip_mode === "hybrid"
    ) {
      patch.drip_mode = body.drip_mode;
    }
  }
  if (typeof body.estimated_duration_minutes === "number")
    patch.estimated_duration_minutes = body.estimated_duration_minutes;
  if (Array.isArray(body.tags))
    patch.tags = (body.tags as unknown[])
      .filter((t): t is string => typeof t === "string")
      .slice(0, 20);
  if (typeof body.status === "string") {
    if (
      body.status === "draft" ||
      body.status === "published" ||
      body.status === "archived"
    ) {
      patch.status = body.status;
    }
  }
  try {
    const updated = await updateCourse(id, patch);
    if (!updated)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ course: updated });
  } catch (err) {
    console.error("[admin/courses] update failed:", err);
    return NextResponse.json(
      { error: "Couldn't save." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  const ok = await deleteCourse(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
