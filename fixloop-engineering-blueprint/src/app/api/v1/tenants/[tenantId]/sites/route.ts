import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { Policy } from "@/lib/auth/policy";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import { z } from "zod";

const CreateSiteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().max(20).optional(),
  timezone: z.string().default("Asia/Kolkata"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const sites = await prisma.site.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { name: "asc" },
    });

    return jsonResponse(sites);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);
    Policy.assert(Policy.canManageSites(ctx.role), "Only Tenant Admins can create sites");

    const body = await req.json();
    const data = CreateSiteSchema.parse(body);

    const site = await prisma.site.create({
      data: {
        tenantId: ctx.tenantId,
        name: data.name,
        code: data.code,
        timezone: data.timezone,
      },
    });

    return jsonResponse(site, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
