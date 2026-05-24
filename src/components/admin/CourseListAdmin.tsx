"use client";

import Link from "next/link";

interface Course {
  id: string;
  slug: string;
  title: string;
  status: string;
  course_type: string;
  pricing_model: string;
}

export default function CourseListAdmin({ initial }: { initial: Course[] }) {
  if (initial.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-12 text-center font-sans text-[14px] font-light text-navy/55">
        No courses yet. Create your first one.
      </p>
    );
  }
  const groups: Record<string, Course[]> = {
    published: [],
    certification: [],
    draft: [],
    archived: [],
  };
  for (const c of initial) {
    if (c.status === "archived") groups.archived.push(c);
    else if (c.course_type === "certification") groups.certification.push(c);
    else if (c.status === "published") groups.published.push(c);
    else groups.draft.push(c);
  }
  return (
    <div className="space-y-8">
      <Group label="Published" items={groups.published} />
      <Group label="Certification" items={groups.certification} />
      <Group label="Drafts" items={groups.draft} />
      <Group label="Archived" items={groups.archived} />
    </div>
  );
}

function Group({ label, items }: { label: string; items: Course[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-serif text-[20px] font-medium tracking-tight text-navy">
        {label}
        <span className="ml-2 font-sans text-[13px] font-light text-navy/45">
          {items.length}
        </span>
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/courses/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-navy/10 bg-white p-5 transition hover:border-cyan-deep/40"
            >
              <div className="min-w-0">
                <p className="font-serif text-[18px] font-medium text-navy">
                  {c.title}
                </p>
                <p className="mt-0.5 font-sans text-[12px] text-navy/55">
                  /{c.slug} · {c.pricing_model.replace(/_/g, " ")}
                </p>
              </div>
              <span className="rounded-full bg-mist px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                {c.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
