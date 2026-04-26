import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const createRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  description: z.string().optional().nullable(),
  permissionIds: z.array(z.string().uuid()).min(1, "Permission wajib dipilih"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        isActive !== null ? { isActive: isActive === "true" } : {},
      ],
    };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return successResponse({
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data roles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRoleSchema.parse(body);

    const existingSlug = await prisma.role.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return errorResponse("Slug sudah digunakan", 409);
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: validatedData.permissionIds,
        },
      },
    });

    if (permissions.length !== validatedData.permissionIds.length) {
      return errorResponse("Permission tidak valid", 400);
    }

    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        permissions: {
          create: validatedData.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await createAuditLog({
      request,
      action: "roles.create",
      resourceType: "roles",
      resourceId: role.id,
      newData: role,
    });

    return successResponse(role, "Role berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat role");
  }
}
