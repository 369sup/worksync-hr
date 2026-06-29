export interface IntegrationEventMetadata {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly causationId?: string;
}
