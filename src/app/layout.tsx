import "./globals.css";
import { Roboto } from "next/font/google";
import { Metadata } from "next";
import ClientWrapper from "@/components/client-wrapper";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Flatex Dashboard",
  description:
    "Flatex Portfolio Statistik: Überblick über Dividenden, Verkäufe und Performance deines Flatex Depots",
  keywords: [
    "Flatex",
    "Depot Auswertung",
    "Portfolio Analyse",
    "Flatex Statistik",
    "Dividenden Tracking",
  ],
  openGraph: {
    title: "Flatex Dashboard",
    description:
      "Flatex Portfolio Statistik: Überblick über Dividenden, Verkäufe und Performance deines Flatex Depots",
    url: "https://flatex-analyzer.jhiga.com",
    siteName: "Flatex Dashboard",
    images: [
      {
        url: "https://flatex-analyzer.jhiga.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flatex Dashboard Vorschau",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flatex Dashboard",
    description:
      "Flatex Portfolio Statistik: Überblick über Dividenden, Verkäufe und Performance deines Flatex Depots",
    images: ["https://flatex-analyzer.jhiga.com/og-image.png"],
  },

  metadataBase: new URL("https://flatex-analyzer.jhiga.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={roboto.variable}>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <body>
        <div className="min-h-svh flex flex-col justify-between">
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </div>
      </body>
    </html>
  );
}
