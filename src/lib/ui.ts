/* Shared brand UI class strings — Joy Spark buttons, eyebrows. */

/* The "Joy Spark": a gold sparkle that unfurls before the label on hover. */
const joySpark =
  "before:content-['✦'] before:text-gold before:leading-none before:w-0 before:opacity-0 before:overflow-hidden before:transition-all before:duration-150 hover:before:w-[1.35em] hover:before:opacity-100";

const btnBase =
  "inline-flex items-center justify-center rounded-full font-sans font-bold uppercase tracking-[0.22em] transition-all duration-150 disabled:pointer-events-none disabled:opacity-50";

/** Primary CTA — Vibrant Cyan, hover swaps to Navy and reveals the Joy Spark. */
export const btnPrimary = `${btnBase} ${joySpark} px-7 py-3.5 text-[10px] bg-cyan text-white hover:bg-navy hover:shadow-[0_0_22px_rgba(0,168,232,0.45)]`;

/** Compact primary CTA — for headers and inline actions. */
export const btnPrimarySm = `${btnBase} ${joySpark} px-5 py-2 text-[10px] bg-cyan text-white hover:bg-navy hover:shadow-[0_0_18px_rgba(0,168,232,0.4)]`;

/** Ghost button for white backgrounds. */
export const btnGhostLight = `${btnBase} px-7 py-3.5 text-[10px] border border-cyan text-cyan hover:bg-cyan hover:text-white`;

/** Ghost button for navy backgrounds. */
export const btnGhostDark = `${btnBase} px-7 py-3.5 text-[10px] border border-cyan text-cyan hover:bg-cyan hover:text-white`;

/** Section eyebrow label. */
export const eyebrow =
  "font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan";
