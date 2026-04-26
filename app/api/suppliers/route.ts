import { NextRequest } from "next/server";
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

const createSupplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter"),
  phone: z.string().optional().nullable(),
  email: optionalEmailSchema,
  address: z.string().optional().nullable(),
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
                { phone: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { address: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        isActive !== null ? { isActive: isActive === "true" } : {},
      ],
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return successResponse({
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data supplier");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSupplierSchema.parse(body);

    const supplier = await prisma.supplier.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
      },
    });

    await createAuditLog({
      request,
      action: "suppliers.create",
      resourceType: "suppliers",
      resourceId: supplier.id,
      newData: supplier,
    });

    return successResponse(supplier, "Supplier berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat supplier");
  }
}
