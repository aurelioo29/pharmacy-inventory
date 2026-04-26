import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().email("Format email tidak valid").optional());

const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  username: z.string().min(3, "Username minimal 3 karakter").optional(),
  email: optionalEmailSchema,
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),

  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        birthPlace: true,
        birthDate: true,
        religion: true,
        education: true,
        bloodType: true,
        maritalStatus: true,
        gender: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail user");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      return errorResponse("User tidak ditemukan", 404);
    }

    if (validatedData.username) {
      const duplicateUsername = await prisma.user.findFirst({
        where: {
          id: { not: id },
          username: validatedData.username,
        },
      });

      if (duplicateUsername) {
        return errorResponse("Username sudah digunakan", 409);
      }
    }

    if (validatedData.email) {
      const duplicateEmail = await prisma.user.findFirst({
        where: {
          id: { not: id },
          email: validatedData.email,
        },
      });

      if (duplicateEmail) {
        return errorResponse("Email sudah digunakan", 409);
      }
    }

    if (validatedData.roleIds) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: validatedData.roleIds,
          },
          isActive: true,
        },
      });

      if (roles.length !== validatedData.roleIds.length) {
        return errorResponse("Role tidak valid", 400);
      }
    }

    const passwordHash = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : undefined;

    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: validatedData.name,
          username: validatedData.username,
          email:
            validatedData.email === undefined ? undefined : validatedData.email,
          passwordHash,
          isActive: validatedData.isActive,
          birthPlace: validatedData.birthPlace,
          birthDate:
            validatedData.birthDate === undefined
              ? undefined
              : validatedData.birthDate
                ? new Date(validatedData.birthDate)
                : null,
          religion: validatedData.religion,
          education: validatedData.education,
          bloodType: validatedData.bloodType,
          maritalStatus: validatedData.maritalStatus,
          gender: validatedData.gender,
        },
      });

      if (validatedData.roleIds) {
        await tx.userRole.deleteMany({
          where: {
            userId: id,
          },
        });

        if (validatedData.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: validatedData.roleIds.map((roleId) => ({
              userId: id,
              roleId,
            })),
          });
        }
      }

      return tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          birthPlace: true,
          birthDate: true,
          religion: true,
          education: true,
          bloodType: true,
          maritalStatus: true,
          gender: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    await createAuditLog({
      request,
      action: "users.update",
      resourceType: "users",
      resourceId: id,
      oldData: existingUser,
      newData: user,
    });

    return successResponse(user, "User berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui user");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await createAuditLog({
      request,
      action: "users.deactivate",
      resourceType: "users",
      resourceId: id,
      oldData: user,
      newData: {
        ...user,
        isActive: false,
      },
    });

    return successResponse(null, "User berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan user");
  }
}
