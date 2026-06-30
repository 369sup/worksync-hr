import type { ReactNode } from "react";
import Link from "next/link";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-black/10 bg-white px-6 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            WorkSync HR
          </p>
          <h1 className="text-2xl font-semibold">HR workspace</h1>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href="/dashboard"
            className="rounded-full border border-black/10 px-4 py-2 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            href="/leave-requests"
            className="rounded-full border border-black/10 px-4 py-2 hover:bg-slate-50"
          >
            Leave requests
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
