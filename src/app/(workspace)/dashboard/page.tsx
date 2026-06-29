import { appManifest } from "@/bootstrap/composition/app-manifest";

export default function DashboardPage() {
  return (
    <main className="grid gap-4">
      <section className="rounded-[1.5rem] border border-black/10 bg-white p-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This route sits in <code>src/app/(workspace)</code> and only handles
          UI composition. Domain behavior remains in <code>src/modules</code>.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {appManifest.contexts.map((context) => (
          <article
            key={context.name}
            className="rounded-[1.5rem] border border-black/10 bg-[var(--color-surface)] p-5"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              {context.kind}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{context.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {context.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
