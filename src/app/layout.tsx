import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steinwall — Governance-First NFRS Compliance",
  description: "Board Room Clarity for ESG compliance. Materiality assessment, emissions data, strategy, and audit-ready documentation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500&family=Outfit:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
