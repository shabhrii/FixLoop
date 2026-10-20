import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  BookOpen,
  Search,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function KnowledgeLibraryPage({ searchParams }: LibraryPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const query = params.q?.trim();

  let closedCases: Array<any> = [];

  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user?.id, isActive: true },
    });

    if (membership) {
      const where: any = {
        tenantId: membership.tenantId,
        status: "CLOSED",
      };

      if (query) {
        where.OR = [
          { caseNumber: { contains: query, mode: "insensitive" } },
          { title: { contains: query, mode: "insensitive" } },
          { partNumber: { contains: query, mode: "insensitive" } },
          { machineId: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ];
      }

      closedCases = await prisma.qualityCase.findMany({
        where,
        orderBy: { closedAt: "desc" },
        include: {
          site: { select: { name: true } },
          closedBy: { select: { displayName: true, email: true } },
          findings: {
            where: { kind: "CONFIRMED" },
            select: { id: true, statement: true },
          },
          actions: {
            where: { status: "COMPLETED" },
            select: { id: true, actionType: true, description: true, completionNote: true },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error loading knowledge library:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Closed Defect & Solution Library
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tenant-scoped repository of verified closed cases, confirmed root causes, and proven corrective actions.
        </p>
      </div>

      {/* Search Bar */}
      <form method="GET" action="/app/library" className="relative max-w-2xl">
        <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          name="q"
          defaultValue={query || ""}
          placeholder="Search closed cases by part number, machine, or defect symptom..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {/* Results List */}
      <div className="space-y-4">
        {closedCases.length === 0 ? (
          <div className="py-16 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No closed cases found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {query
                ? `No closed records matched query "${query}".`
                : "Once nonconformances are verified effective and closed, their solutions appear here for recurrence prevention."}
            </p>
          </div>
        ) : (
          closedCases.map((qc) => (
            <div
              key={qc.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {qc.caseNumber}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{qc.site?.name}</span>
                  {qc.partNumber && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-300">Part: {qc.partNumber}</span>
                    </>
                  )}
                  {qc.machineId && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-300">Cell: {qc.machineId}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Closed {qc.closedAt ? new Date(qc.closedAt).toLocaleDateString() : ""}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {qc.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {qc.description}
                </p>
              </div>

              {/* Confirmed Root Causes */}
              {qc.findings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed Root Cause
                  </div>
                  {qc.findings.map((f: any) => (
                    <p key={f.id} className="text-xs text-emerald-200/90 font-medium">
                      {f.statement}
                    </p>
                  ))}
                </div>
              )}

              {/* Actions Taken */}
              {qc.actions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5" />
                    Proven Corrective Measures
                  </div>
                  <div className="space-y-1">
                    {qc.actions.map((a: any) => (
                      <div key={a.id} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{a.description} {a.completionNote ? `— "${a.completionNote}"` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/app/cases/${qc.id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Inspect Full Case & Audit Trail
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
