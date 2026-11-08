export interface FinanceAuditEntry {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  data?: unknown;
}

export interface FinanceAuditLogRepositoryPort {
  record(entry: FinanceAuditEntry): Promise<void>;
}
