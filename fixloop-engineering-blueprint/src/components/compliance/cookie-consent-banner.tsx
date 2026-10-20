"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X, Settings2, Check } from "lucide-react";

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

const STORAGE_KEY = "fixloop_cookie_consent_v1";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [preferencesConsent, setPreferencesConsent] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it animates in smoothly without jarring initial load
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        // Dispatch event for existing preferences so tracking modules know status
        window.dispatchEvent(
          new CustomEvent("fixloop:consent-ready", { detail: parsed })
        );
      }
    } catch {
      // In private browsing or storage disabled, default to visible
      setIsVisible(true);
    }
  }, []);

  const savePreferences = (analytics: boolean, prefs: boolean) => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      // Also set document cookie for edge/middleware detection if needed
      document.cookie = `fixloop_consent=${encodeURIComponent(
        JSON.stringify({ a: analytics ? 1 : 0, p: prefs ? 1 : 0 })
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      // Local storage unavailable
    }

    // Trigger event for analytics wrapper to hook into
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fixloop:consent-updated", { detail: preferences })
      );
    }

    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    savePreferences(true, true);
  };

  const handleRejectNonEssential = () => {
    savePreferences(false, false);
  };

  const handleSaveCustom = () => {
    savePreferences(analyticsConsent, preferencesConsent);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl text-slate-200">
        {!showPreferences ? (
          <div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5 border border-blue-500/20">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  Privacy & Cookie Preferences
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  We use strictly essential cookies for secure session JWTs and RBAC isolation. Optional analytics help us optimize platform performance.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  <span>•</span>
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                    Terms & Conditions
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium text-xs transition-all flex items-center justify-center"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-2 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-1 sm:ml-auto"
                title="Customize preferences"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-400" />
                Customize Cookie Settings
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Essential & Authentication
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Required for passwordless login, encrypted session JWT, and multi-tenant isolation.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">Analytics & Performance</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Measures system latency, page transitions, and feature usability in aggregated anonymized form.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Preferences */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">Functional Preferences</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Remembers workspace layout state and dark mode preferences across sessions.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={preferencesConsent}
                    onChange={(e) => setPreferencesConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowPreferences(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
