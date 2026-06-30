import type { ActorContext } from "@/shared/types/actor-context";

export interface SubmitLeaveRequestCommand {
  actor: ActorContext;
  leaveTypeId: string;
  startAt: Date;
  endAt: Date;
  reason: string;
  idempotencyKey: string;
}
