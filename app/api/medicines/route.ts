import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const createMedicineSchema = z.object({
  categoryId: z.string().uuid("Kategori tidak valid"),
  unitId: z.string().uuid("Satuan tidak valid"),
  code: z.string().min(2, "Kode obat minimal 2 karakter"),
  name: z.string().min(2, "Nama obat minimal 2 karakter"),
  description: z.string().optional().nullable(),
  minimumStock: z.number().int().min(0, "Minimum stock minimal 0"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const isActive = searchParams.get("isActive");
    const categoryId = searchParams.get("categoryId") || "";
    const unitId = searchParams.get("unitId") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { code: { contains: search, mode: "insensitive" as const } },
                { name: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        isActive !== null ? { isActive: isActive === "true" } : {},
        categoryId ? { categoryId } : {},
        unitId ? { unitId } : {},
      ],
    };

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          unit: {
            select: {
              id: true,
              name: true,
              symbol: true,
            },
          },
        },
      }),
      prisma.medicine.count({ where }),
    ]);

    return successResponse({
      medicines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data obat");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMedicineSchema.parse(body);

    const existingCode = await prisma.medicine.findUnique({
      where: {
        code: validatedData.code,
      },
    });

    if (existingCode) {
      return errorResponse("Kode obat sudah digunakan", 409);
    }

    const [category, unit] = await Promise.all([
      prisma.medicineCategory.findUnique({
        where: {
          id: validatedData.categoryId,
        },
      }),
      prisma.medicineUnit.findUnique({
        where: {
          id: validatedData.unitId,
        },
      }),
    ]);

    if (!category || !category.isActive) {
      return errorResponse("Kategori tidak valid", 400);
    }

    if (!unit || !unit.isActive) {
      return errorResponse("Satuan tidak valid", 400);
    }

    const medicine = await prisma.medicine.create({
      data: {
        categoryId: validatedData.categoryId,
        unitId: validatedData.unitId,
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description || null,
        minimumStock: validatedData.minimumStock,
      },
      include: {
        category: true,
        unit: true,
      },
    });

    await createAuditLog({
      request,
      action: "medicines.create",
      resourceType: "medicines",
      resourceId: medicine.id,
      newData: medicine,
    });

    return successResponse(medicine, "Obat berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat obat");
  }
}
