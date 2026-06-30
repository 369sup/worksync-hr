import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkSync HR",
  description:
    "Multi-tenant attendance, leave, overtime, and payroll platform.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-page)] text-[var(--color-ink)]">
        {children}
        {modal ?? null}
      </body>
    </html>
  );
}
