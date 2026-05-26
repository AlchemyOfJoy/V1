import { redirect } from "next/navigation";

/**
 * /my-work is the canonical route per Synthesis Spec §9. The existing
 * /me page renders the same content (the trophy room, with documents
 * + memories + future). For now /my-work is a redirect to /me so the
 * footer links work; the full §9 layout rewrite is a follow-up.
 */
export default function MyWorkPage() {
  redirect("/me");
}
