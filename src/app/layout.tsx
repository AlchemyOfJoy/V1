import type { Metadata, Viewport } from "next";
import { EB_Garamond, Raleway } from "next/font/google";
import { SITE, siteUrl } from "@/lib/site";
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

const title = `${SITE.name} · ${SITE.author}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: [
    "Joy Quotient",
    "JQ assessment",
    "joy",
    "wellbeing",
    "self-assessment",
    "Brent Freeman",
    "The Alchemy of Joy",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
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
