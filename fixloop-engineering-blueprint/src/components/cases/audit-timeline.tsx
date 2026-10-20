"use client";

import { useEffect, useState } from "react";
import { Clock, Shield, User, RefreshCw } from "lucide-react";

interface AuditTimelineProps {
  tenantId: string;
  caseId: string;
}

interface AuditEventItem {
  id: string;
  eventName: string;
  entityType: string;
  entityId: string;
  caseVersion?: number | null;
  createdAt: string;
  actor: {
    id: string;
    displayName: string | null;
    email: string;
  };
  metadata: Record<string, any>;
}

export function AuditTimeline({ tenantId, caseId }: AuditTimelineProps) {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/timeline`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load audit events");
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [tenantId, caseId]);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#2F5F91]" />
          <h3 className="text-sm font-bold text-[#17212F] uppercase tracking-wider">
            Immutable Audit Trail
          </h3>
        </div>
        <button
          onClick={fetchTimeline}
          disabled={isLoading}
          className="p-1.5 text-[#526173] hover:text-[#17212F] rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh audit events"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-xs text-[#526173] mb-6">
        Tamper-resistant append-only event log recording every transition, root-cause confirmation, and verification check.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#B42318] mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-xs text-[#526173]">
          Loading audit trail...
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#526173]">
          No audit events recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D8E0E9]">
          {events.map((ev) => {
            const date = new Date(ev.createdAt);
            return (
              <div key={ev.id} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[1.85rem] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#2F5F91] group-hover:scale-125 transition-transform" />

                <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#D8E0E9] hover:border-[#2F5F91]/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#2F5F91]">
                      {ev.eventName.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-mono text-[#526173] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {date.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-[#17212F]">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>{ev.actor.displayName || ev.actor.email}</span>
                    {ev.caseVersion && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#D8E0E9] text-[#526173]">
                        v{ev.caseVersion}
                      </span>
                    )}
                  </div>

                  {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#D8E0E9] text-[11px] font-mono text-[#526173] bg-white p-2 rounded-lg border border-[#D8E0E9] overflow-x-auto">
                      <pre className="text-[10px] leading-tight">
                        {JSON.stringify(ev.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
