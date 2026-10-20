"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  AlertOctagon,
  CheckSquare,
  BookOpen,
  Building2,
  Users,
  LogOut,
  Plus,
  Shield,
  Layers,
  Menu,
  X,
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

/* Role display metadata — design.md §7.9 explicit role labels */
const ROLE_META: Record<TenantRole, { label: string }> = {
  QUALITY_ENGINEER: { label: "Quality Engineer" },
  OPERATOR: { label: "Operator" },
  ACTION_OWNER: { label: "Action Owner" },
  TENANT_ADMIN: { label: "Tenant Admin" },
  AUDITOR: { label: "Auditor" },
};

export function WorkspaceShell({ user, membership, children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleMeta = ROLE_META[membership.role] || { label: membership.role };

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

  const isNavActive = (href: string) =>
    href === "/app" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--fl-surface-muted)", color: "var(--fl-text)" }}>

      {/* ================================================================
          Desktop sidebar
          ================================================================ */}
      <aside
        className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 z-40"
        style={{
          backgroundColor: "var(--fl-surface)",
          borderRight: "1px solid var(--fl-border)",
        }}
        aria-label="Application navigation"
      >
        {/* Brand / wordmark */}
        <div
          className="h-16 px-6 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--fl-border)" }}
        >
          <Link
            href="/app"
            className="flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-fl-blue-700"
            aria-label="FixLoop — go to overview"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "var(--fl-blue-700)" }}
            >
              FL
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: "var(--fl-text)" }}>
                FixLoop
              </div>
              <div className="text-[10px] font-mono" style={{ color: "var(--fl-text-muted)" }}>
                Precision QMS
              </div>
            </div>
          </Link>
        </div>

        {/* Tenant context — design.md §6 show current workspace */}
        <div
          className="px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--fl-border)", backgroundColor: "var(--fl-blue-050)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Workspace
            </span>
          </div>
          <div className="text-sm font-semibold truncate" style={{ color: "var(--fl-text)" }}>
            {membership.tenantName}
          </div>
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono"
            style={{
              backgroundColor: "var(--fl-blue-100)",
              color: "var(--fl-blue-900)",
              border: "1px solid var(--fl-blue-600)",
            }}
          >
            <Shield className="h-3 w-3" aria-hidden="true" />
            {roleMeta.label}
          </div>
        </div>

        {/* Report defect CTA */}
        <div className="px-5 py-3.5 shrink-0">
          <Link
            href="/app/cases/new"
            id="sidebar-report-defect"
            className="w-full py-2.5 px-4 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors hover:bg-[var(--fl-blue-800)] shadow-sm"
            style={{ backgroundColor: "var(--fl-blue-700)" }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Report nonconformance
          </Link>
        </div>

        {/* Navigation links */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5"
          aria-label="Main navigation"
        >
          <div
            className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--fl-text-muted)" }}
          >
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "" : "hover:bg-[var(--fl-blue-050)]"
                }`}
                style={{
                  backgroundColor: active ? "var(--fl-blue-100)" : "transparent",
                  color: active ? "var(--fl-blue-900)" : "var(--fl-text-muted)",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          {/* Admin section */}
          {membership.role === "TENANT_ADMIN" && (
            <div className="pt-3 space-y-0.5">
              <div
                className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--fl-text-muted)" }}
              >
                Administration
              </div>
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? "" : "hover:bg-[var(--fl-blue-050)]"
                    }`}
                    style={{
                      backgroundColor: active ? "var(--fl-blue-100)" : "transparent",
                      color: active ? "var(--fl-blue-900)" : "var(--fl-text-muted)",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User + logout */}
        <div
          className="p-3.5 flex items-center justify-between shrink-0"
          style={{ borderTop: "1px solid var(--fl-border)", backgroundColor: "var(--fl-surface)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: "var(--fl-blue-100)", color: "var(--fl-blue-900)" }}
            >
              {(user.displayName || user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: "var(--fl-text)" }}>
                {user.displayName || user.email.split("@")[0]}
              </div>
              <div className="text-[11px] truncate font-mono" style={{ color: "var(--fl-text-muted)" }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-[var(--fl-danger)] shrink-0"
            style={{ color: "var(--fl-text-muted)" }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ================================================================
          Main content area
          ================================================================ */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header
          className="md:hidden h-14 px-4 flex items-center justify-between sticky top-0 z-30"
          style={{
            backgroundColor: "var(--fl-surface)",
            borderBottom: "1px solid var(--fl-border)",
          }}
        >
          <Link href="/app" className="flex items-center gap-2" aria-label="FixLoop overview">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "var(--fl-blue-700)" }}
            >
              FL
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--fl-text)" }}>FixLoop</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--fl-blue-100)",
                color: "var(--fl-blue-900)",
                border: "1px solid var(--fl-blue-600)",
              }}
            >
              {roleMeta.label}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--fl-text-muted)" }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Page container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
