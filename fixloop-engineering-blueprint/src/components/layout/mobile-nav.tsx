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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-1 text-blue-400 -mt-5"
              >
                <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-slate-900">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-semibold mt-0.5 text-blue-400">Report</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs transition-colors ${
                isActive ? "text-blue-400 font-medium" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
