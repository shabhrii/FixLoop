"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, AlertOctagon, CheckSquare, BookOpen, PlusCircle } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/cases", label: "Cases", icon: AlertOctagon },
    { href: "/app/cases/new", label: "Report", icon: PlusCircle, highlight: true },
    { href: "/app/actions", label: "Actions", icon: CheckSquare },
    { href: "/app/library", label: "Library", icon: BookOpen },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-2"
      style={{
        backgroundColor: "var(--fl-surface)",
        borderTop: "1px solid var(--fl-border)",
        boxShadow: "0 -1px 4px rgba(23,33,47,0.08)",
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/app" && item.href !== "/app/cases/new" && pathname.startsWith(item.href));

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Report new nonconformance"
                className="flex flex-col items-center justify-center p-1 -mt-5"
              >
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: "var(--fl-blue-700)", border: "3px solid var(--fl-surface)" }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: "var(--fl-blue-700)" }}
                >
                  Report
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center p-1.5 rounded-lg text-xs transition-colors min-w-[48px] min-h-[48px]"
              style={{ color: isActive ? "var(--fl-blue-700)" : "var(--fl-text-muted)" }}
            >
              <Icon className="h-5 w-5 mb-0.5 shrink-0" aria-hidden="true" />
              <span
                className="text-[10px] font-medium"
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
