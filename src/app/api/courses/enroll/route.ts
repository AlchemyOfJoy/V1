import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/courses";
import { enroll } from "@/lib/enrollments";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { slug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug)
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });

  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "published")
    return NextResponse.json({ error: "Course not available." }, { status: 404 });

  // Paid courses route to a checkout flow in a later phase; for now,
  // gate enrollment so the data model is honest.
  if (
    course.pricing_model === "paid_one_time" ||
    course.pricing_model === "paid_subscription"
  ) {
    return NextResponse.json(
      {
        error:
          "This is a paid course. Checkout opens once Stripe Connect is wired.",
      },
      { status: 402 },
    );
  }

  const enrollment = await enroll(user.id, course.id);
  return NextResponse.json({ enrollment });
}
