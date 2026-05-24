import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createCourse, listCourses } from "@/lib/courses";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const courses = await listCourses({ includeDrafts: true });
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  let body: { title?: unknown; slug?: unknown; course_type?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  let slug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!title)
    return NextResponse.json({ error: "Title required." }, { status: 400 });
  if (!slug)
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  const courseType =
    body.course_type === "certification" ? "certification" : "standard";
  try {
    const course = await createCourse({
      title,
      slug,
      course_type: courseType,
      instructor_id: admin.id,
    });
    return NextResponse.json({ course });
  } catch (err) {
    console.error("[admin/courses] create failed:", err);
    return NextResponse.json(
      { error: "Couldn't create — slug might be taken." },
      { status: 500 },
    );
  }
}
