import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Blogy Tools — Free SEO & Authority APIs",
    template: "%s · Blogy Tools",
  },
  description:
    "Production-grade SEO tools and developer APIs. DA/PA estimation, SERP scraping, metadata audits — transparent scoring, no fake numbers.",
  openGraph: {
    type: "website",
    siteName: "Blogy Tools",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-app text-fg overflow-x-hidden">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
