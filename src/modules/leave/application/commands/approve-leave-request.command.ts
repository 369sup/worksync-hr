import type { ActorContext } from "@/shared/types/actor-context";

export interface ApproveLeaveRequestCommand {
  readonly actor: ActorContext;
  readonly leaveRequestId: string;
}
