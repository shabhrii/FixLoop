import { CaseStatus } from "@prisma/client";
import {
  FileEdit,
  Send,
  AlertTriangle,
  GitBranch,
  PlayCircle,
  Clock,
  CheckCircle2,
  RefreshCcw,
  XCircle,
} from "lucide-react";

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; bg: string; icon: any; border: string; text: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-800/80",
    border: "border-slate-700",
    text: "text-slate-300",
    icon: FileEdit,
  },
  SUBMITTED: {
    label: "Submitted",
    bg: "bg-blue-950/60",
    border: "border-blue-700/60",
    text: "text-blue-300",
    icon: Send,
  },
  TRIAGE: {
    label: "Triage",
    bg: "bg-amber-950/60",
    border: "border-amber-700/60",
    text: "text-amber-300",
    icon: AlertTriangle,
  },
  INVESTIGATING: {
    label: "5-Why Investigating",
    bg: "bg-purple-950/60",
    border: "border-purple-700/60",
    text: "text-purple-300",
    icon: GitBranch,
  },
  ACTION_IN_PROGRESS: {
    label: "Action in Progress",
    bg: "bg-cyan-950/60",
    border: "border-cyan-700/60",
    text: "text-cyan-300",
    icon: PlayCircle,
  },
  VERIFICATION_PENDING: {
    label: "Verification Pending",
    bg: "bg-indigo-950/60",
    border: "border-indigo-700/60",
    text: "text-indigo-300",
    icon: Clock,
  },
  CLOSED: {
    label: "Closed & Verified",
    bg: "bg-emerald-950/60",
    border: "border-emerald-700/60",
    text: "text-emerald-300",
    icon: CheckCircle2,
  },
  REOPENED: {
    label: "Reopened",
    bg: "bg-rose-950/60",
    border: "border-rose-700/60",
    text: "text-rose-300",
    icon: RefreshCcw,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-slate-900/60",
    border: "border-slate-800",
    text: "text-slate-500",
    icon: XCircle,
  },
};

export function CaseStatusBadge({ status, className = "", size = "md" }: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
      <span>{config.label}</span>
    </span>
  );
}
