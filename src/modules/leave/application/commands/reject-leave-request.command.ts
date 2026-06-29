import type { ActorContext } from "@/shared/types/actor-context";

export interface RejectLeaveRequestCommand {
  readonly actor: ActorContext;
  readonly leaveRequestId: string;
  readonly rejectionReason: string;
}
