import {
  CaseStatus,
  Severity,
  FindingKind,
  ActionStatus,
  ActionType,
  EffectivenessOutcome,
  EvidenceType,
  EvidenceStatus,
  SuggestionStatus,
  SuggestionType,
  TenantRole,
} from "@prisma/client";

export {
  CaseStatus,
  Severity,
  FindingKind,
  ActionStatus,
  ActionType,
  EffectivenessOutcome,
  EvidenceType,
  EvidenceStatus,
  SuggestionStatus,
  SuggestionType,
  TenantRole,
};

export interface SiteDto {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface UserSummaryDto {
  id: string;
  email: string;
  displayName: string | null;
}

export interface EvidenceDto {
  id: string;
  originalFilename: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: Date | string;
  caption?: string | null;
}

export interface FindingDto {
  id: string;
  kind: FindingKind;
  statement: string;
  confirmedAt?: Date | string | null;
  confirmedBy?: UserSummaryDto | null;
  createdBy?: UserSummaryDto | null;
  evidenceLinks: Array<{ evidence: EvidenceDto }>;
}

export interface WhyStepDto {
  id: string;
  stepNumber: number;
  question: string;
  answer?: string | null;
  evidenceLinks: Array<{ evidence: EvidenceDto }>;
}

export interface ActionDto {
  id: string;
  actionType: ActionType;
  title?: string | null;
  description: string;
  status: ActionStatus;
  isRequired: boolean;
  dueAt: Date | string;
  completionNote?: string | null;
  completedAt?: Date | string | null;
  assignee: UserSummaryDto;
  completedBy?: UserSummaryDto | null;
  proofLinks: Array<{ evidence: EvidenceDto }>;
  version: number;
}

export interface EffectivenessCheckDto {
  id: string;
  criterion: string;
  sampleSize: number;
  outOfToleranceCount: number;
  outcome: EffectivenessOutcome;
  notes?: string | null;
  reviewedAt: Date | string;
  reviewer: UserSummaryDto;
  evidenceLinks: Array<{ evidence: EvidenceDto }>;
}

export interface QualityCaseSummaryDto {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  severity: Severity;
  category?: string | null;
  partNumber?: string | null;
  machineId?: string | null;
  createdAt: Date | string;
  submittedAt?: Date | string | null;
  closedAt?: Date | string | null;
  version: number;
  site: SiteDto;
  reportedBy: UserSummaryDto;
  _count?: {
    evidence: number;
    actions: number;
    findings: number;
  };
}

export interface QualityCaseDetailDto extends QualityCaseSummaryDto {
  triageOwner?: UserSummaryDto | null;
  closedBy?: UserSummaryDto | null;
  operation?: string | null;
  specification?: string | null;
  observedValue?: number | string | null;
  unit?: string | null;
  quantityInspected?: number | null;
  quantityAffected?: number | null;
  containmentAssessment?: string | null;
  reopenReason?: string | null;
  evidence: EvidenceDto[];
  findings: FindingDto[];
  investigations: Array<{
    id: string;
    whySteps: WhyStepDto[];
  }>;
  actions: ActionDto[];
  effectivenessChecks: EffectivenessCheckDto[];
  aiSuggestions: Array<{
    id: string;
    status: SuggestionStatus;
    suggestionType: SuggestionType;
    outputJson: unknown;
    requestedAt: Date | string;
  }>;
}
