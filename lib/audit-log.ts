import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

type CreateAuditLogParams = {
  request?: NextRequest;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldData?: unknown;
  newData?: unknown;
};

export async function createAuditLog({
  request,
  action,
  resourceType,
  resourceId = null,
  oldData = null,
  newData = null,
}: CreateAuditLogParams) {
  try {
    const session = await auth();

    await prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,

        user: session?.user?.id
          ? {
              connect: { id: session.user.id },
            }
          : undefined,

        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,

        ipAddress:
          request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers.get("x-real-ip") ||
          null,

        userAgent: request?.headers.get("user-agent") || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
