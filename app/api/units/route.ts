import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const createUnitSchema = z.object({
  name: z.string().min(1, "Nama satuan wajib diisi"),
  symbol: z.string().optional().nullable(),
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
                { symbol: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        isActive !== null ? { isActive: isActive === "true" } : {},
      ],
    };

    const [units, total] = await Promise.all([
      prisma.medicineUnit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.medicineUnit.count({ where }),
    ]);

    return successResponse({
      units,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data satuan");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUnitSchema.parse(body);

    const unit = await prisma.medicineUnit.create({
      data: {
        name: validatedData.name,
        symbol: validatedData.symbol || null,
      },
    });

    await createAuditLog({
      request,
      action: "units.create",
      resourceType: "units",
      resourceId: unit.id,
      newData: unit,
    });

    return successResponse(unit, "Satuan berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat satuan");
  }
}
