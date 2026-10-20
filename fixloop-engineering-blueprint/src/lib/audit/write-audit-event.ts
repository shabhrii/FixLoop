import { Prisma, ActorType } from "@prisma/client";
import prisma from "@/lib/db/prisma";

export interface WriteAuditParams {
  tenantId: string;
  caseId?: string;
  actorType?: ActorType;
  actorId?: string;
  eventName: string;
  entityType: string;
  entityId: string;
  caseVersion?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes audit metadata to prevent secrets, tokens, or raw blobs from persisting in audit records.
 */
function sanitizeMetadata(metadata?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;

  const sanitized: Record<string, unknown> = {};
  const forbiddenKeys = ["password", "token", "secret", "authorization", "signedurl", "blob", "bytes", "cookie"];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (forbiddenKeys.some((k) => lowerKey.includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = JSON.parse(JSON.stringify(value));
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as Prisma.InputJsonValue;
}

/**
 * Appends an audit event atomically using caller's transaction or standard Prisma client.
 */
export async function writeAuditEvent(
  params: WriteAuditParams,
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;
  return await db.auditEvent.create({
    data: {
      tenantId: params.tenantId,
      caseId: params.caseId,
      actorType: params.actorType ?? "USER",
      actorId: params.actorId,
      eventName: params.eventName,
      entityType: params.entityType,
      entityId: params.entityId,
      caseVersion: params.caseVersion,
      reason: params.reason,
      metadata: sanitizeMetadata(params.metadata),
    },
  });
}
