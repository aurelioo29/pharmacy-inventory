import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const updateRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter").optional(),
  slug: z.string().min(2, "Slug minimal 2 karakter").optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return errorResponse("Role tidak ditemukan", 404);
    }

    return successResponse(role);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail role");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!existingRole) {
      return errorResponse("Role tidak ditemukan", 404);
    }

    if (validatedData.slug) {
      const duplicateSlug = await prisma.role.findFirst({
        where: {
          id: { not: id },
          slug: validatedData.slug,
        },
      });

      if (duplicateSlug) {
        return errorResponse("Slug sudah digunakan", 409);
      }
    }

    if (validatedData.permissionIds) {
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
    }

    const role = await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          isActive: validatedData.isActive,
        },
      });

      if (validatedData.permissionIds) {
        await tx.rolePermission.deleteMany({
          where: {
            roleId: id,
          },
        });

        if (validatedData.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: validatedData.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }

      return tx.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    await createAuditLog({
      request,
      action: "roles.update",
      resourceType: "roles",
      resourceId: id,
      oldData: existingRole,
      newData: role,
    });

    return successResponse(role, "Role berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui role");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return errorResponse("Role tidak ditemukan", 404);
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await createAuditLog({
      request,
      action: "roles.deactivate",
      resourceType: "roles",
      resourceId: id,
      oldData: role,
      newData: updatedRole,
    });

    return successResponse(null, "Role berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan role");
  }
}
