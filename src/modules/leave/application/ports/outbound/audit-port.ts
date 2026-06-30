import type { ActorContext } from "@/shared/types/actor-context";

export interface AuditPort {
  append(input: {
    readonly actor: ActorContext;
    readonly action: string;
    readonly targetRef: { readonly type: string; readonly id: string };
    readonly result: "success" | "denied" | "failed";
    readonly reason?: string;
    readonly occurredAt: Date;
  }): Promise<void>;
}
