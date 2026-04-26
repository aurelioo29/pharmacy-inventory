import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().email("Format email tidak valid").optional());

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: optionalEmailSchema,
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleIds: z.array(z.string().uuid()).min(1, "Role wajib dipilih"),

  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const isActive = searchParams.get("isActive");
    const gender = searchParams.get("gender") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                {
                  username: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        isActive !== null ? { isActive: isActive === "true" } : {},
        gender ? { gender } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return errorResponse("Username sudah digunakan", 409);
    }

    if (validatedData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingEmail) {
        return errorResponse("Email sudah digunakan", 409);
      }
    }

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

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        username: validatedData.username,
        email: validatedData.email || null,
        passwordHash,
        birthPlace: validatedData.birthPlace || null,
        birthDate: validatedData.birthDate
          ? new Date(validatedData.birthDate)
          : null,
        religion: validatedData.religion || null,
        education: validatedData.education || null,
        bloodType: validatedData.bloodType || null,
        maritalStatus: validatedData.maritalStatus || null,
        gender: validatedData.gender || null,
        roles: {
          create: validatedData.roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
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

    await createAuditLog({
      request,
      action: "users.create",
      resourceType: "users",
      resourceId: user.id,
      newData: user,
    });

    return successResponse(user, "User berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat user");
  }
}
