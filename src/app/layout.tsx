import type { Metadata, Viewport } from "next";
import { EB_Garamond, Raleway } from "next/font/google";
import "../../styles/global.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Joy Quotient · The Alchemy of Joy",
  description:
    "Measure your Joy Quotient, save your score, and track how your joy grows over time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${garamond.variable} ${raleway.variable}`}>
      <body className="min-h-screen bg-white font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
