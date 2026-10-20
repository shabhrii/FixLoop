# FixLoop — Complete Local Run Guide

This guide walks you through setting up, launching, testing, and demonstrating the **FixLoop** quality management application on your local machine.

---

## 1. Quick Start (TL;DR)

If you already have prerequisites installed, you can start the application in 3 steps:

### Terminal 1: Start PostgreSQL Database
```powershell
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "c:\Rishabh\hackathons\ty\FixLoop\fixloop-engineering-blueprint\.pgdata"
```

### Terminal 2: Seed Data & Launch App
```powershell
# In c:\Rishabh\hackathons\ty\FixLoop\fixloop-engineering-blueprint

# 1. Seed demo tenants, users, and cases
npm run db:seed

# 2. Start Next.js development server
npm run dev
```

### Open in Browser
👉 Navigate to: **[http://localhost:3000/login](http://localhost:3000/login)**  
Log in with: `qe@synthetic-demo.com` (Demo Quality Engineer)

---

## 2. System Architecture & Prerequisites

| Component | Technology | Local Configuration |
|---|---|---|
| **Runtime** | Node.js (v20+ / v24+) | Pinned in `package.json` |
| **Framework** | Next.js 15 (App Router) + React 19 + TailwindCSS | Port `3000` |
| **Database** | PostgreSQL 18 with Prisma ORM | Port `5433` (Data folder: `.pgdata/`) |
| **Authentication** | Passwordless Session JWT with HTTP-only cookies | Secret in `.env` |
| **Storage** | Local disk private storage with HMAC-signed URLs | `local-evidence/` directory |
| **AI Provider** | Provider-neutral adapter with deterministic Mock provider | No paid API key required |

---

## 3. Environment Configuration

The application uses [.env.local](file:///c:/Rishabh/hackathons/ty/FixLoop/fixloop-engineering-blueprint/.env.local) (or `.env`). Ensure the following values are set:

```ini
# Application Origin
NODE_ENV=development
APP_ORIGIN=http://localhost:3000

# PostgreSQL Connection (Local cluster on port 5433)
DATABASE_URL="postgresql://postgres:fixloop_dev_secure_2026@127.0.0.1:5433/fixloop"
DIRECT_URL="postgresql://postgres:fixloop_dev_secure_2026@127.0.0.1:5433/fixloop"
QUEUE_DATABASE_URL="postgresql://postgres:fixloop_dev_secure_2026@127.0.0.1:5433/fixloop"

# Security & Sessions
AUTH_COOKIE_SECRET="development_cookie_secret_at_least_32_chars_long_12345"
SIGNED_URL_TTL_SECONDS=300
UPLOAD_MAX_BYTES=15728640

# AI Configuration (Deterministic mock provider for local development)
AI_ENABLED=true
AI_PROVIDER=mock
AI_MODEL=mock-v1
AI_API_KEY=mock-key
AI_TIMEOUT_MS=12000
```

---

## 4. Step-by-Step Setup Guide

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Start the PostgreSQL Database Server
FixLoop includes an initialized local PostgreSQL cluster located in `.pgdata/` configured for port `5433`.

```powershell
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "c:\Rishabh\hackathons\ty\FixLoop\fixloop-engineering-blueprint\.pgdata"
```
*Note: Keep this terminal window open while running the app.*

### Step 3: Synchronize Prisma Schema
Generate Prisma client types and synchronize the schema with the database:

```powershell
# Generate Prisma Client
npm run db:generate

# Sync schema tables if starting fresh
npm run db:push
```

### Step 4: Seed Synthetic Test Fixtures
Populate the database with demo manufacturing tenants (*Apex Precision Components* and *B-Corp Machining*), plants, demo users across all 5 roles, and a pre-configured sample defect case:

```powershell
npm run db:seed
```

### Step 5: Start the Development Server
```powershell
npm run dev
```

The application is now accessible at **[http://localhost:3000](http://localhost:3000)**.

---

## 5. Demo Accounts & Role Permissions

The login page at **`/login`** provides passwordless authentication. Simply type or click one of the pre-seeded demo user accounts:

| Role | Demo Email | Capabilities & Workflow Permissions |
|---|---|---|
| **Quality Engineer (QE)** | `qe@synthetic-demo.com` | **Full Lifecycle Authority**: Can triage defects, confirm 5-Why root causes, record quantitative verification checks, and close cases. |
| **Operator** | `operator@synthetic-demo.com` | **Defect Reporter**: Can submit defect intake tickets and upload photos. Closure attempts are rejected by server guards. |
| **Action Owner** | `actionowner@synthetic-demo.com` | **Remediation Owner**: Assigned to corrective actions. Can upload proof and mark actions as complete. |
| **Tenant Admin** | `admin@synthetic-demo.com` | **Workspace Admin**: Can add sites, update plants, and manage user memberships. |
| **Auditor** | `auditor@synthetic-demo.com` | **Read-Only Compliance**: Can view cases, audit logs, and generated compliance snapshots. |
| **Tenant B User** | `engineer@tenant-b-synthetic.com` | **Multi-Tenant Isolation Test**: Belongs to *B-Corp Machining*. Cannot see or modify Tenant A cases. |

---

## 6. End-to-End Application Walkthrough

### 1. View Defect Queues
* Visit **`/app/cases`** to view all active defect tickets.
* Notice pre-seeded defect **`CASE-2026-0001`**: *"Bore diameter oversized on spindle housing"*.

### 2. Report a New Defect (Intake)
* Click **"+ New Defect Case"** or navigate to **`/app/cases/new`**.
* Select Plant Site (e.g. *Pune Machining Plant 1*).
* Enter Part Number, Machine Cell, Observed Measurement (e.g., `45.025 mm`), and Tolerance Specification.
* Attach defect photos through the private signed upload component.
* Submit ticket.

### 3. Case Investigation & 5-Why RCA
* Click into any case from the queue (**`/app/cases/[caseId]`**).
* **AI Copilot Panel**: Request AI suggestions for potential cause hypotheses. Review and explicitly **Accept**, **Edit**, or **Reject** suggestions.
* **5-Why Editor**: Add ordered root-cause steps linking evidence to claims.
* **Confirm Root Cause**: Click *"Confirm Cause"* (requires Quality Engineer role and rationale).

### 4. Corrective Action & Verification
* **Assign Action**: Add a Corrective or Containment Action with an owner and due date.
* **Attach Proof & Complete**: Upload completion proof (e.g., calibration certificate) to complete the action.
* **Effectiveness Review**: Enter sample size (e.g. 50 pieces) and out-of-tolerance count (0 pieces). Mark review as `EFFECTIVE`.

### 5. Case Closure with Guardrails
* Click **"Close Case"**.
* The server-side policy ([case-policy.ts](file:///c:/Rishabh/hackathons/ty/FixLoop/fixloop-engineering-blueprint/src/server/policies/case-policy.ts)) automatically validates:
  1. Caller is a Quality Engineer.
  2. All required corrective actions are completed with verified proof evidence.
  3. An explicit human review of `EFFECTIVE` has been recorded.
  *(If any condition fails, closure is blocked with explicit diagnostic reasons).*

### 6. Audit Trail & Snapshot Export
* Scroll to the **Audit Timeline** at the bottom of the case detail page to review the tamper-evident log of all mutations.
* Click **"Export Audit Snapshot"** to generate an immutable, SHA-256 verified JSON report snapshot.

---

## 7. Running the Test Suite

Run the automated test suite with Vitest:

```powershell
npm test
```

### Test Coverage
* `tests/unit/case-policy.test.ts` (8 tests): Validates state transitions, closure guard conditions, and unauthorized role rejections.
* `tests/unit/ai-schema.test.ts` (3 tests): Validates Zod JSON schemas and untrusted AI output rejection.
* `tests/unit/validation.test.ts` (8 tests): Tests input validation for defect intake, file sizes, and quantities.
* `tests/integration/tenant-isolation.test.ts` (4 tests): Tests live database cross-tenant 404 denials and the complete lifecycle.

---

## 8. Building for Production

To test the production build:

```powershell
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 9. Troubleshooting & FAQ

### Q: Error `Can't reach database server at 127.0.0.1:5433`
**Fix:** The PostgreSQL database process is not running. Start it using:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "c:\Rishabh\hackathons\ty\FixLoop\fixloop-engineering-blueprint\.pgdata"
```

### Q: PostgreSQL says `another server might be running` or exits immediately
**Fix:** If the machine or terminal was forcibly closed, a stale `postmaster.pid` file might remain. Remove it and restart:
```powershell
Remove-Item .pgdata\postmaster.pid -Force
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "c:\Rishabh\hackathons\ty\FixLoop\fixloop-engineering-blueprint\.pgdata"
```

### Q: Port 3000 is already in use
**Fix:** Either terminate the existing Next.js process or run on another port:
```powershell
npx next dev -p 3001
```

### Q: How do I completely reset the database to a clean state?
```powershell
npm run db:seed
```
This cleans all tables and re-seeds fresh demonstration fixtures.
