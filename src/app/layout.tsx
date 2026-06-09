import type { Metadata } from "next";
import { Anton, Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { TransitionProvider } from "@/components/ui/page-transition";
import { Attribution } from "@/components/analytics/attribution";
import { Pixels } from "@/components/analytics/pixels";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "fatfinger. The slip that moves markets",
  description:
    "fat finger (n.): the slip that moves markets. also: your sharpest read on them. Markets media with quant-grade analysis and a sense of humour, in a newsletter you'll actually want to open.",
  metadataBase: new URL("https://fatfinger.news"),
  openGraph: {
    title: "fatfinger. The slip that moves markets",
    description:
      "Markets media for people who take their money seriously and themselves less so. Quant-grade analysis, a sense of humour, no gatekeeping.",
    url: "https://fatfinger.news",
    siteName: "fatfinger.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${poppins.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <TransitionProvider>{children}</TransitionProvider>
        <Attribution />
        <Analytics />
        <Pixels />
      </body>
    </html>
  );
}
