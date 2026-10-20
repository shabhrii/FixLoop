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

/**
 * STATUS_CONFIG uses light-theme design tokens from design.md §3.
 * Each status is identifiable by text label + icon, not color alone (§3 color rules, §10 accessibility).
 */
const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; style: React.CSSProperties; icon: any }
> = {
  DRAFT: {
    label: "Draft",
    style: {
      backgroundColor: "#F7F9FC",
      color: "#526173",
      borderColor: "#D8E0E9",
    },
    icon: FileEdit,
  },
  SUBMITTED: {
    label: "Submitted",
    style: {
      backgroundColor: "#E7EFF7",
      color: "#245B86",
      borderColor: "#3E74A8",
    },
    icon: Send,
  },
  TRIAGE: {
    label: "Triage",
    style: {
      backgroundColor: "#FEF3C7",
      color: "#8A5700",
      borderColor: "#D97706",
    },
    icon: AlertTriangle,
  },
  INVESTIGATING: {
    label: "5-Why Investigating",
    style: {
      backgroundColor: "#EDE9FE",
      color: "#5B21B6",
      borderColor: "#7C3AED",
    },
    icon: GitBranch,
  },
  ACTION_IN_PROGRESS: {
    label: "Action in Progress",
    style: {
      backgroundColor: "#ECFDF5",
      color: "#065F46",
      borderColor: "#059669",
    },
    icon: PlayCircle,
  },
  VERIFICATION_PENDING: {
    label: "Verification Pending",
    style: {
      backgroundColor: "#E0E7FF",
      color: "#3730A3",
      borderColor: "#4F46E5",
    },
    icon: Clock,
  },
  CLOSED: {
    label: "Closed & Verified",
    style: {
      backgroundColor: "#DCFCE7",
      color: "#216E4A",
      borderColor: "#16A34A",
    },
    icon: CheckCircle2,
  },
  REOPENED: {
    label: "Reopened",
    style: {
      backgroundColor: "#FEF2F2",
      color: "#B42318",
      borderColor: "#DC2626",
    },
    icon: RefreshCcw,
  },
  CANCELLED: {
    label: "Cancelled",
    style: {
      backgroundColor: "#F7F9FC",
      color: "#526173",
      borderColor: "#D8E0E9",
    },
    icon: XCircle,
  },
};

export function CaseStatusBadge({ status, className = "", size = "md" }: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-[11px] gap-1.5 leading-normal"
      : "px-3 py-1 text-xs gap-2 leading-normal";

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-full border whitespace-nowrap ${sizeClasses} ${className}`}
      style={config.style}
    >
      <Icon className={size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
