import Image from "next/image";

/** Full Brent Freeman logo lockup. Use `light` on navy backgrounds. */
export default function BrandLogo({
  variant = "navy",
  className,
  priority = false,
}: {
  variant?: "navy" | "light";
  className?: string;
  priority?: boolean;
}) {
  const isLight = variant === "light";
  return (
    <Image
      src={isLight ? "/brand-logo-light.png" : "/brand-logo.png"}
      alt="Brent Freeman"
      width={isLight ? 1165 : 1560}
      height={isLight ? 153 : 202}
      priority={priority}
      className={className}
    />
  );
}
