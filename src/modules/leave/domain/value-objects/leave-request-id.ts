export class LeaveRequestId {
  private constructor(public readonly value: string) {}

  static create(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error("LeaveRequestId cannot be empty.");
    }

    return new LeaveRequestId(normalized);
  }

}
