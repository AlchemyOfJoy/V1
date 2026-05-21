/* Shared brand UI class strings — keeps buttons and eyebrows consistent. */

export const btnBase =
  "inline-flex items-center justify-center rounded-full px-7 py-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50";

/** Primary CTA — Electric Cyan fill, signature hover-to-navy swap. */
export const btnPrimary = `${btnBase} bg-cyan text-bone hover:bg-navy`;

/** Ghost button for light (bone) backgrounds. */
export const btnGhostLight = `${btnBase} border border-cyan/55 text-cyan hover:bg-cyan hover:text-bone`;

/** Ghost button for dark (navy) backgrounds. */
export const btnGhostDark = `${btnBase} border border-bone/30 text-bone hover:bg-bone hover:text-navy`;

/** Section eyebrow label. */
export const eyebrow =
  "font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan";
