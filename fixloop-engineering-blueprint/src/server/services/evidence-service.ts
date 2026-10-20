import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { PrivateStorage } from "@/lib/storage/private-storage";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { EvidenceStatus, EvidenceType } from "@prisma/client";
import { z } from "zod";
import { CreateUploadIntentSchema, FinalizeEvidenceSchema } from "@/lib/validation/evidence";

export const EvidenceService = {
  /**
   * Generates a server-controlled upload intent and signed URL.
   */
  async createUploadIntent(
    ctx: TenantContext,
    caseId: string,
    input: z.infer<typeof CreateUploadIntentSchema>
  ) {
    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    const objectKey = PrivateStorage.generateObjectKey(ctx.tenantId, caseId, input.fileName);
    const intent = await PrivateStorage.createSignedUploadUrl(ctx.tenantId, caseId, objectKey);

    return await prisma.$transaction(async (tx) => {
      const evidence = await tx.caseEvidence.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          uploadedById: ctx.user.id,
          objectKey,
          originalFileName: input.fileName,
          contentType: input.fileType,
          byteSize: BigInt(input.fileSize),
          evidenceType: input.evidenceType as EvidenceType,
          caption: input.caption,
          status: EvidenceStatus.UPLOAD_PENDING,
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "EVIDENCE_INTENT_CREATED",
          entityType: "CaseEvidence",
          entityId: evidence.id,
          metadata: { fileName: input.fileName, fileType: input.fileType },
        },
        tx
      );

      return {
        evidence,
        uploadUrl: intent.uploadUrl,
        expiresAt: intent.expiresAt,
      };
    });
  },

  /**
   * Finalizes evidence once bytes have been uploaded, checking existence and checksum.
   */
  async finalizeEvidence(
    ctx: TenantContext,
    evidenceId: string,
    input?: z.infer<typeof FinalizeEvidenceSchema>
  ) {
    const evidence = await prisma.caseEvidence.findFirst({
      where: { id: evidenceId, tenantId: ctx.tenantId },
    });
    if (!evidence) throw DomainError.notFound("Evidence");

    // Inspect object in private storage
    const inspection = await PrivateStorage.inspectObject(evidence.objectKey);
    if (!inspection) {
      throw DomainError.validation("Uploaded file not found in storage. Upload may not have completed.");
    }

    return await prisma.$transaction(async (tx) => {
      const finalized = await tx.caseEvidence.update({
        where: { id: evidence.id },
        data: {
          status: EvidenceStatus.AVAILABLE,
          byteSize: BigInt(inspection.size),
          sha256: inspection.checksumSha256,
          finalizedAt: new Date(),
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: evidence.caseId,
          actorId: ctx.user.id,
          eventName: "EVIDENCE_FINALIZED",
          entityType: "CaseEvidence",
          entityId: evidence.id,
          metadata: {
            checksum: inspection.checksumSha256,
            size: inspection.size,
          },
        },
        tx
      );

      return finalized;
    });
  },

  /**
   * Re-authorizes and generates a short-lived download URL.
   */
  async createDownloadUrl(ctx: TenantContext, evidenceId: string) {
    const evidence = await prisma.caseEvidence.findFirst({
      where: { id: evidenceId, tenantId: ctx.tenantId },
    });
    if (!evidence) throw DomainError.notFound("Evidence");

    if (evidence.status !== EvidenceStatus.AVAILABLE) {
      throw DomainError.validation("Evidence is not available for download");
    }

    const { downloadUrl, expiresAt } = await PrivateStorage.createSignedDownloadUrl(
      ctx.tenantId,
      evidence.objectKey
    );

    return {
      downloadUrl,
      fileName: evidence.originalFileName,
      fileType: evidence.contentType,
      expiresAt,
    };
  },
};
