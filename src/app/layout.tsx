import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { Inter, Sora } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PaperTrace — Research Signals, Tools & Community",
  description:
    "A bilingual research commons for live signals, interactive paper deep-dives, research tools, executable skills, and community.",
  alternates: {
    types: { "application/rss+xml": "https://yayajjiang.github.io/PaperTrace/feed.xml" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable}`}>
      <head>
        {/* Run before React hydrates — sets data-lang on <html> from localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('papertrace-lang');if(l==='zh')document.documentElement.setAttribute('data-lang','zh');}catch(e){}})()`,
          }}
        />
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('papertrace-theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&prefersDark))document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
