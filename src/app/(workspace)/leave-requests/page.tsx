import { cookies } from "next/headers";

import { createLeaveApiRuntime } from "@/bootstrap/composition/create-leave-api-runtime";

async function loadVisibleRequests() {
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) return { state: "unauthenticated" as const, items: [] };

  const runtime = createLeaveApiRuntime();
  try {
    const identity =
      await runtime.authentication.verifySessionCookie(sessionCookie);
    const actor = await runtime.actors.create(identity, crypto.randomUUID());
    const result = await runtime.search.execute({
      actor,
      criteria: { page: 1, pageSize: 20 },
    });
    return { state: "ready" as const, items: result.items };
  } catch {
    return { state: "unavailable" as const, items: [] };
  } finally {
    await runtime.close();
  }
}

export default async function LeaveRequestsPage() {
  const requests = await loadVisibleRequests();

  return (
    <main className="grid gap-4">
      <section className="rounded-[1.5rem] border border-black/10 bg-white p-6">
        <h2 className="text-2xl font-semibold">Leave request workspace</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This page authenticates the session, resolves a trusted ActorContext,
          and reads only the requests allowed by the Leave query use case.
        </p>
      </section>

      <section className="grid gap-4">
        {requests.state !== "ready" ? (
          <p className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-sm text-slate-600">
            {requests.state === "unauthenticated"
              ? "Sign in to view leave requests."
              : "Leave requests are temporarily unavailable."}
          </p>
        ) : null}
        {requests.items.map((request) => (
          <article
            key={request.id}
            className="rounded-[1.5rem] border border-black/10 bg-[var(--color-surface)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{request.id}</h3>
                <p className="text-sm text-slate-600">
                  {request.employeeId} · {request.leaveTypeCode}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                {request.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {request.startAt} to {request.endAt}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Submitted at {request.submittedAt}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
