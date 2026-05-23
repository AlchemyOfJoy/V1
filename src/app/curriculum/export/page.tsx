import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Export",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Your workbook · Yours forever"
      title={
        <>
          <em className="text-cyan-deep">Export</em> your work
        </>
      }
      subtitle="Download your responses as a printable workbook PDF."
      whatItIs="A beautifully typeset PDF mirroring the printed Alchemy of Joy™ workbook — with every answer you&apos;ve written, in the same warm layout. A keepsake."
      howToDoIt="Click Generate. The PDF includes your current responses, your latest JQ, and the relevant readings — ready to print and bind, or to live on your hard drive."
    />
  );
}
