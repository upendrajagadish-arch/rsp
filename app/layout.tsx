import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Skill Passport",
  description:
    "Evidence-based digital skill identity for colleges — certificates, verified skills, and placement readiness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://db.onlinewebfonts.com/c/08e020de1811ec4489f82d1247a42c09?family=Helvetica+Now+Text"
          rel="stylesheet"
        />
        <link
          href="https://db.onlinewebfonts.com/c/060e116a70e3096c52db16f61aaab194?family=Sofia+Pro+Regular"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
