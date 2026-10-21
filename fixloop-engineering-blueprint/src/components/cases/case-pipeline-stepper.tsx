"use client";

import {
  FileEdit,
  ShieldAlert,
  GitBranch,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { CaseStatus } from "@prisma/client";

interface CasePipelineStepperProps {
  status: CaseStatus;
  hasConfirmedFinding: boolean;
  actionsCount: number;
  completedActionsCount: number;
  hasEffectivenessPass: boolean;
  userRole?: string;
}

export function CasePipelineStepper({
  status,
  hasConfirmedFinding,
  actionsCount,
  completedActionsCount,
  hasEffectivenessPass,
  userRole,
}: CasePipelineStepperProps) {
  // Determine step progress
  // Step 1: Intake (DRAFT / SUBMITTED)
  // Step 2: Triage & Containment (TRIAGE / INVESTIGATING)
  // Step 3: 5-Why Root Cause (INVESTIGATING)
  // Step 4: Action Execution & Proof (ACTION_IN_PROGRESS)
  // Step 5: Effectiveness Verification (VERIFICATION_PENDING)
  // Step 6: Closed & Verified (CLOSED)

  const isClosed = status === "CLOSED";
  const isVerificationPending = status === "VERIFICATION_PENDING";
  const isActionInProgress = status === "ACTION_IN_PROGRESS";
  const isInvestigating = status === "INVESTIGATING";
  const isTriage = status === "TRIAGE" || status === "SUBMITTED";

  const steps = [
    {
      id: "intake",
      label: "1. Intake",
      role: "Operator",
      icon: FileEdit,
      isDone: status !== "DRAFT",
      isActive: status === "DRAFT" || status === "SUBMITTED",
      desc: "Report nonconformance & photo",
    },
    {
      id: "triage",
      label: "2. QA Triage",
      role: "Quality Engineer",
      icon: ShieldAlert,
      isDone: status !== "DRAFT" && status !== "SUBMITTED" && status !== "TRIAGE",
      isActive: status === "SUBMITTED" || status === "TRIAGE",
      desc: "Assess containment & severity",
    },
    {
      id: "investigation",
      label: "3. 5-Why Cause",
      role: "Quality Engineer",
      icon: GitBranch,
      isDone: hasConfirmedFinding || isActionInProgress || isVerificationPending || isClosed,
      isActive: isInvestigating,
      desc: "Drill root cause & confirm",
    },
    {
      id: "actions",
      label: "4. Action & Proof",
      role: "Action Verifier",
      icon: Wrench,
      isDone: actionsCount > 0 && completedActionsCount === actionsCount,
      isActive: isActionInProgress,
      desc: `${completedActionsCount}/${actionsCount} actions completed`,
    },
    {
      id: "verification",
      label: "5. Effectiveness",
      role: "Quality Engineer",
      icon: ShieldCheck,
      isDone: hasEffectivenessPass || isClosed,
      isActive: isVerificationPending,
      desc: "Statistical check & sample verification",
    },
    {
      id: "closure",
      label: "6. Closure",
      role: "QE / Approver",
      icon: CheckCircle2,
      isDone: isClosed,
      isActive: isClosed,
      desc: "Tamper-evident lock",
    },
  ];

  // Call-to-action text depending on active stage and user role
  let bannerMessage = "";
  let bannerRoleBadge = "";

  if (isActionInProgress) {
    bannerRoleBadge = "Action Verifier Step";
    bannerMessage =
      "Action tasks are assigned. The Action Owner / Verifier must complete remediation and attach proof evidence (or waiver) to advance the case.";
  } else if (isVerificationPending) {
    bannerRoleBadge = "Quality Engineer Step";
    bannerMessage =
      "Remediation verifier has completed all required actions! The Quality Engineer must now record statistical effectiveness verification to authorize case closure.";
  } else if (isInvestigating) {
    bannerRoleBadge = "Quality Engineer Step";
    bannerMessage =
      "Investigation in progress. Drill through 5-Why steps and confirm root cause findings, then assign corrective action tasks.";
  } else if (isTriage) {
    bannerRoleBadge = "Quality Engineer Step";
    bannerMessage =
      "Nonconformance submitted. Quality Engineer must assess containment and release to 5-Why root cause investigation.";
  } else if (isClosed) {
    bannerRoleBadge = "Closed & Verified";
    bannerMessage =
      "This case has been verified effective and closed with an immutable tamper-resistant audit signature.";
  }

  return (
    <div
      className="p-5 rounded-2xl shadow-sm space-y-4"
      style={{
        backgroundColor: "var(--fl-surface)",
        border: "1px solid var(--fl-border)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#D8E0E9]">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#2F5F91]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#17212F]">
            FixLoop Quality Pipeline Tracker
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#526173]">
          Active Stage: <strong className="text-[#2F5F91]">{status.replace(/_/g, " ")}</strong>
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.isDone;
          const isActive = step.isActive;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border text-xs transition-all relative ${
                isActive
                  ? "bg-[#E7EFF7] border-[#2F5F91] shadow-sm ring-2 ring-[#2F5F91]/20"
                  : isDone
                  ? "bg-emerald-50/70 border-emerald-200 text-[#216E4A]"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-[#2F5F91]"
                      : isDone
                      ? "text-[#216E4A]"
                      : "text-slate-400"
                  }`}
                />
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#216E4A]" />
                ) : isActive ? (
                  <span className="h-2 w-2 rounded-full bg-[#2F5F91] animate-ping" />
                ) : null}
              </div>

              <div
                className={`font-bold ${
                  isActive
                    ? "text-[#2F5F91]"
                    : isDone
                    ? "text-[#216E4A]"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </div>

              <div className="text-[10px] text-[#526173] font-mono mt-0.5 truncate">
                {step.role}
              </div>

              <div className="text-[10px] text-[#526173] mt-1 line-clamp-1">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Guidance Banner */}
      {bannerMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isVerificationPending
              ? "bg-indigo-50 border-indigo-200 text-[#3730A3]"
              : isActionInProgress
              ? "bg-amber-50 border-amber-200 text-[#8A5700]"
              : isClosed
              ? "bg-emerald-50 border-emerald-200 text-[#216E4A]"
              : "bg-[#E7EFF7] border-blue-200 text-[#245B86]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-bold mr-1.5 px-2 py-0.5 rounded-md bg-white/70 border text-[10px] font-mono uppercase tracking-wider">
                {bannerRoleBadge}
              </span>
              <span>{bannerMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
