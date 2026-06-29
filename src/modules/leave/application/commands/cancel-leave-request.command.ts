import type { ActorContext } from "@/shared/types/actor-context";

export interface CancelLeaveRequestCommand {
  readonly actor: ActorContext;
  readonly leaveRequestId: string;
  readonly overrideReason?: string;
}
