"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  LayoutDashboard,
  AlertOctagon,
  CheckSquare,
  BookOpen,
  Building2,
  Users,
  LogOut,
  Plus,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { TenantRole } from "@/types/auth";
import { MobileNav } from "./mobile-nav";

interface WorkspaceShellProps {
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
  membership: {
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    role: TenantRole;
  };
  children: React.ReactNode;
}

const ROLE_STYLES: Record<TenantRole, { label: string; color: string }> = {
  QUALITY_ENGINEER: {
    label: "Quality Engineer",
    color: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  OPERATOR: {
    label: "Operator",
    color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  ACTION_OWNER: {
    label: "Action Owner",
    color: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  TENANT_ADMIN: {
    label: "Tenant Admin",
    color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  AUDITOR: {
    label: "Auditor",
    color: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  },
};

export function WorkspaceShell({ user, membership, children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleMeta = ROLE_STYLES[membership.role] || {
    label: membership.role,
    color: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const navLinks = [
    { href: "/app", label: "Overview", icon: LayoutDashboard },
    { href: "/app/cases", label: "Quality Cases", icon: AlertOctagon },
    { href: "/app/actions", label: "Corrective Actions", icon: CheckSquare },
    { href: "/app/library", label: "Closed Library", icon: BookOpen },
  ];

  const adminLinks = [
    { href: "/app/admin/sites", label: "Factory Sites", icon: Building2 },
    { href: "/app/admin/members", label: "Team Members", icon: Users },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md fixed top-0 bottom-0 left-0 z-40">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">FixLoop</span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono">Precision QMS</span>
            </div>
          </Link>
        </div>

        {/* Tenant Scope Card */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium uppercase tracking-wider text-[10px]">Active Tenant</span>
          </div>
          <div className="font-semibold text-sm text-white truncate">
            {membership.tenantName}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${roleMeta.color}">
            <Shield className="h-3 w-3" />
            {roleMeta.label}
          </div>
        </div>

        {/* Action Button: Report Defect */}
        <div className="px-4 pt-4">
          <Link
            href="/app/cases/new"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report Nonconformance
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
              </Link>
            );
          })}

          {/* Admin section if TENANT_ADMIN */}
          {membership.role === "TENANT_ADMIN" && (
            <div className="pt-4 space-y-1">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Administration
              </div>
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="font-semibold text-xs text-white truncate">
              {user.displayName || user.email.split("@")[0]}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="md:hidden h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/app" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">FixLoop</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
              {membership.role}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
