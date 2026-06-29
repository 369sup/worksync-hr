import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUP HR App",
  description:
    "Documentation-first HR platform scaffold with Hexagonal Architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-page)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}
