"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * When the Up Next surface deep-links a user to /me/letters?open=ID,
 * mark that letter opened (so it leaves the "unread today" priority on
 * Home) and scroll it into view. Clears the query param so reloading
 * the page doesn't re-trigger.
 */
export default function OpenLetterEffect() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("open");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/letters/${id}/open`, { method: "POST" }).catch(() => {});
    const el = document.getElementById(`letter-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[#C89A3F]");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-[#C89A3F]"),
        3500,
      );
    }
    router.replace("/me/letters", { scroll: false });
  }, [id, router]);

  return null;
}
