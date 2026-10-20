import { PrismaClient, TenantRole, CaseStatus, Severity } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding synthetic test fixtures...");

  // Clean existing seed if any
  await prisma.auditEvent.deleteMany();
  await prisma.actionEvidence.deleteMany();
  await prisma.action.deleteMany();
  await prisma.whyStepEvidence.deleteMany();
  await prisma.whyStep.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.findingEvidence.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.effectivenessEvidence.deleteMany();
  await prisma.effectivenessCheck.deleteMany();
  await prisma.caseEvidence.deleteMany();
  await prisma.caseComment.deleteMany();
  await prisma.caseReport.deleteMany();
  await prisma.aiSuggestion.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.qualityCase.deleteMany();
  await prisma.site.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-admin-demo",
      email: "admin@synthetic-demo.com",
      displayName: "Demo Admin",
    },
  });

  const qeUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-qe-demo",
      email: "qe@synthetic-demo.com",
      displayName: "Demo Quality Engineer",
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-operator-demo",
      email: "operator@synthetic-demo.com",
      displayName: "Demo Operator",
    },
  });

  const actionOwnerUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-actionowner-demo",
      email: "actionowner@synthetic-demo.com",
      displayName: "Demo Action Owner",
    },
  });

  const auditorUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-auditor-demo",
      email: "auditor@synthetic-demo.com",
      displayName: "Demo Auditor",
    },
  });

  // User in Tenant B (for cross-tenant tests)
  const tenantBUser = await prisma.user.create({
    data: {
      authSubject: "auth-sub-tenant-b-user",
      email: "engineer@tenant-b-synthetic.com",
      displayName: "Tenant B Engineer",
    },
  });

  // 2. Create Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: "Apex Precision Components (Demo Synthetic)",
      slug: "apex-precision-demo",
      isActive: true,
    },
  });

  // 3. Create Tenant B (Separate isolated tenant)
  const tenantB = await prisma.tenant.create({
    data: {
      name: "B-Corp Machining (Demo Synthetic Isolation)",
      slug: "b-corp-demo",
      isActive: true,
    },
  });

  // 4. Assign Memberships in Tenant A
  await prisma.membership.createMany({
    data: [
      { tenantId: tenantA.id, userId: adminUser.id, role: TenantRole.TENANT_ADMIN, isActive: true },
      { tenantId: tenantA.id, userId: qeUser.id, role: TenantRole.QUALITY_ENGINEER, isActive: true },
      { tenantId: tenantA.id, userId: operatorUser.id, role: TenantRole.OPERATOR, isActive: true },
      { tenantId: tenantA.id, userId: actionOwnerUser.id, role: TenantRole.ACTION_OWNER, isActive: true },
      { tenantId: tenantA.id, userId: auditorUser.id, role: TenantRole.AUDITOR, isActive: true },
    ],
  });

  // Assign Membership in Tenant B
  await prisma.membership.create({
    data: {
      tenantId: tenantB.id,
      userId: tenantBUser.id,
      role: TenantRole.QUALITY_ENGINEER,
      isActive: true,
    },
  });

  // 5. Sites for Tenant A
  const sitePune = await prisma.site.create({
    data: {
      tenantId: tenantA.id,
      name: "Pune Machining Plant 1",
      code: "PN-01",
      timezone: "Asia/Kolkata",
    },
  });

  const siteChakan = await prisma.site.create({
    data: {
      tenantId: tenantA.id,
      name: "Chakan Assembly Line",
      code: "CK-02",
      timezone: "Asia/Kolkata",
    },
  });

  // Site for Tenant B
  await prisma.site.create({
    data: {
      tenantId: tenantB.id,
      name: "Aurangabad Plant B",
      code: "AG-01",
      timezone: "Asia/Kolkata",
    },
  });

  // 6. Seed a sample case in Tenant A
  const sampleCase = await prisma.qualityCase.create({
    data: {
      tenantId: tenantA.id,
      siteId: sitePune.id,
      caseNumber: "CASE-2026-0001",
      title: "Bore diameter oversized on spindle housing (Synthetic Demo)",
      description: "During incoming inspection of lot #492, 3 parts showed bore diameter exceeding the +0.015mm tolerance limit.",
      category: "Dimensional Deviation",
      severity: Severity.HIGH,
      status: CaseStatus.TRIAGE,
      partNumber: "PART-SP-440",
      machineId: "CNC-LATHE-02",
      operation: "Finish Bore Turning",
      observedValue: 45.022,
      unit: "mm",
      specification: "45.000 +/- 0.010 mm",
      quantityInspected: 50,
      quantityAffected: 3,
      reportedById: operatorUser.id,
      triageOwnerId: qeUser.id,
      submittedAt: new Date(),
    },
  });

  // Audit event for case creation
  await prisma.auditEvent.create({
    data: {
      tenantId: tenantA.id,
      caseId: sampleCase.id,
      actorId: operatorUser.id,
      actorType: "USER",
      eventName: "CASE_CREATED",
      entityType: "QualityCase",
      entityId: sampleCase.id,
      caseVersion: 1,
      metadata: { initialSeverity: "HIGH", reportedBy: operatorUser.email },
    },
  });

  console.log("Synthetic demo fixtures successfully seeded.");
  console.log(`Tenant A: ${tenantA.name} (${tenantA.id})`);
  console.log(`Tenant B: ${tenantB.name} (${tenantB.id})`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
