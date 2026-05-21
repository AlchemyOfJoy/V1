import Image from "next/image";

/** BF monogram mark. Use `light` on navy backgrounds. */
export default function Monogram({
  variant = "navy",
  className,
}: {
  variant?: "navy" | "light";
  className?: string;
}) {
  const isLight = variant === "light";
  return (
    <Image
      src={isLight ? "/monogram-light.png" : "/monogram.png"}
      alt="Brent Freeman"
      width={isLight ? 185 : 249}
      height={isLight ? 118 : 158}
      className={className}
    />
  );
}
