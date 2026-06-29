import Link from "next/link";

import { appManifest } from "@/bootstrap/composition/app-manifest";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
      <section className="grid gap-6 rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-accent)]">
          Hexagonal Architecture
        </p>
        <div className="grid gap-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            SUP HR App scaffold now runs on{" "}
            <span className="text-[var(--color-accent)]">src/app</span>.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            The route layer lives in <code>src/app</code>, the domain lives in{" "}
            <code>src/modules</code>, and system wiring stays in{" "}
            <code>src/bootstrap</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Open workspace
          </Link>
          <Link
            href="/leave-requests"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50"
          >
            View leave scaffold
          </Link>
          <a
            href="/api/health"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50"
          >
            Health endpoint
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-black/10 bg-[var(--color-surface)] p-6">
          <h2 className="text-xl font-semibold">Current route root</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            <code>{appManifest.routeRoot}</code> is the only valid route root in
            this repository.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-black/10 bg-[var(--color-surface)] p-6">
          <h2 className="text-xl font-semibold">First bounded context</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            <code>{appManifest.primaryContext}</code> is scaffolded with domain,
            application, adapter, and contract folders.
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {appManifest.contexts.map((context) => (
          <article
            key={context.name}
            className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              {context.kind}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{context.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {context.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
