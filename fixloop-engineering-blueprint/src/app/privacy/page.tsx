import Link from "next/link";
import { Cpu, ArrowLeft, Shield, Lock, FileText, CheckCircle2, Clock, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FixLoop Precision QMS",
  description: "Privacy policy, tenant data sovereignty, and AI safety controls for FixLoop Precision Quality Management System.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 20, 2026";
  const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME || "FixLoop Platform Operator";
  const contactEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fixloop.local";

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FixLoop
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/50">
                Precision QMS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
            >
              Workspace Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex-1">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
            <Shield className="h-3.5 w-3.5" />
            Enterprise Data Protection & Privacy Governance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            FixLoop Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Effective Date: {lastUpdated}
            </span>
            <span className="text-slate-600">•</span>
            <span>Version: 2.1 (Production Standard)</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              GDPR & ISO 9001:2015 Compliant
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">01.</span>
              Scope & B2B Architecture Overview
            </h2>
            <p>
              This document outlines the privacy baseline for the FixLoop platform operated by {operatorName} (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). FixLoop provides a multi-tenant, zero-trust precision quality management platform designed for discrete manufacturing facilities, machining plants, and industrial fabrication sites. This Privacy Policy governs our processing of personal data, authentication credentials, and shop-floor manufacturing nonconformance telemetry collected through our platform.
            </p>
            <p className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <em>Pilot Disclaimer:</em> Specific pilot customer agreements, non-disclosure agreements (NDAs), and Data Processing Agreements (DPAs) executed with factory tenants supersede general provisions herein. Contact details are configurable per deployment.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">02.</span>
              Data We Collect & Process
            </h2>
            <p>We process the following categories of information strictly for operational and quality verification purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-blue-400 mb-1.5">
                  Identity & Session Credentials
                </h3>
                <p className="text-xs text-slate-400">
                  User email addresses, full names, assigned factory sites, cryptographic password hashes, and HTTP-only session JWT cookies.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-cyan-400 mb-1.5">
                  Manufacturing Defect Telemetry
                </h3>
                <p className="text-xs text-slate-400">
                  Part numbers, machining cell identifiers, operation codes, observed physical dimensions, tolerance deviations, and sample sizes.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-teal-400 mb-1.5">
                  Private Nonconformance Evidence
                </h3>
                <p className="text-xs text-slate-400">
                  Photographic inspection evidence, calibration certificates, CMM report files, and corrective proof documentation.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-purple-400 mb-1.5">
                  Immutable Audit Logs
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographically hashed snapshot records (SHA-256), UTC timestamps, actor IDs, state transition history, and closure approvals.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">03.</span>
              Tenant Data Sovereignty & Strict Isolation
            </h2>
            <p>
              FixLoop enforces rigid, multi-tenant row-level and object-level authorization barriers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong className="text-white">Customer Data Ownership:</strong> Each customer retains sole, unencumbered ownership of all defect tickets, CAD references, part specifications, and quality records.
              </li>
              <li>
                <strong className="text-white">Isolation Assurance:</strong> Data belonging to one factory tenant is physically and logically partitioned. Cross-tenant access attempts are rejected with non-revealing 404 responses at both API handler and policy layers.
              </li>
              <li>
                <strong className="text-white">No Public Exposure:</strong> Private evidence and case logs are never made publicly queryable or crawlable by search engines.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">04.</span>
              AI Safety & Machine Learning Governance
            </h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-900/40 text-slate-300 space-y-2">
              <p className="font-medium text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                Zero Training on Proprietary Customer Data
              </p>
              <p className="text-xs text-slate-400">
                FixLoop AI Copilot suggestions are evaluated in isolated sandboxes using validated schemas. We do NOT use your proprietary engineering tolerances, part geometries, or defect reports to train public foundational language or vision models.
              </p>
              <p className="text-xs text-slate-400">
                All AI-generated hypotheses are classified as unverified suggestions until an authorized human Quality Engineer explicitly reviews, accepts, or rejects them.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">05.</span>
              HMAC-Signed Private Storage & Security
            </h2>
            <p>
              Evidence files uploaded to FixLoop are stored in private storage backends. Access is mediated through server-generated HMAC-signed URLs with a maximum lifespan of 300 seconds. Direct unauthenticated object reads are blocked at the network perimeter.
            </p>
            <p>
              All data in transit is encrypted using TLS 1.3 with mandatory HTTPS redirection and Strict-Transport-Security (HSTS) headers. Data at rest is encrypted using AES-256 standard encryption.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">06.</span>
              Cookie & Telemetry Policy
            </h2>
            <p>
              FixLoop utilizes strictly essential cookies required for session authentication and CSRF defense, alongside optional anonymized telemetry when explicitly permitted by the user:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-300 border-b border-slate-800">
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Lifespan</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-400">
                  <tr>
                    <td className="p-3 font-mono text-blue-400">fixloop_session</td>
                    <td className="p-3 font-semibold text-emerald-400">Strictly Essential</td>
                    <td className="p-3">7 Days</td>
                    <td className="p-3">Encrypted HTTP-only JWT for tenant authentication and RBAC.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-blue-400">fixloop_cookie_consent</td>
                    <td className="p-3 font-semibold text-emerald-400">Strictly Essential</td>
                    <td className="p-3">1 Year</td>
                    <td className="p-3">Persists user consent preferences for compliance.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-slate-400">fixloop_analytics</td>
                    <td className="p-3 font-semibold text-amber-400">Optional Analytics</td>
                    <td className="p-3">Session</td>
                    <td className="p-3">Anonymized performance metrics (only active upon consent).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">07.</span>
              Data Subject Rights & Tenant Controls
            </h2>
            <p>
              Under applicable data protection laws (including GDPR, CCPA/CPRA, and India DPDP 2023), authorized users and tenant administrators have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>Request an immutable export of all closed case histories and audit snapshots.</li>
              <li>Rectify personal account details and plant site associations.</li>
              <li>Request deactivation of memberships and deletion of non-regulatory telemetry.</li>
              <li>Lodge inquiries or compliance audits with our Data Protection Officer.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">08.</span>
              Contact & Data Protection Officer
            </h2>
            <p>
              For privacy inquiries, compliance verification requests, or data processing agreements (DPA), please contact our privacy office:
            </p>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-white">{operatorName} — Privacy & Compliance</p>
                <p className="text-xs text-slate-400 mt-0.5">Manufacturing Telemetry & Data Sovereignty Inquiries</p>
              </div>
              <a
                href={`mailto:${contactEmail}`}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-mono transition-all flex items-center gap-2 border border-slate-700"
              >
                <Mail className="h-4 w-4" />
                {contactEmail}
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {operatorName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-slate-300 underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Workspace Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
