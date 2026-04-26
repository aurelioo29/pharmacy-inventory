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

const updateMedicineSchema = z.object({
  categoryId: z.string().uuid("Kategori tidak valid").optional(),
  unitId: z.string().uuid("Satuan tidak valid").optional(),
  code: z.string().min(2, "Kode obat minimal 2 karakter").optional(),
  name: z.string().min(2, "Nama obat minimal 2 karakter").optional(),
  description: z.string().optional().nullable(),
  minimumStock: z.number().int().min(0, "Minimum stock minimal 0").optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
      },
    });

    if (!medicine) {
      return errorResponse("Obat tidak ditemukan", 404);
    }

    return successResponse(medicine);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail obat");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateMedicineSchema.parse(body);

    const existingMedicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
      },
    });

    if (!existingMedicine) {
      return errorResponse("Obat tidak ditemukan", 404);
    }

    if (validatedData.code) {
      const duplicateCode = await prisma.medicine.findFirst({
        where: {
          id: { not: id },
          code: validatedData.code,
        },
      });

      if (duplicateCode) {
        return errorResponse("Kode obat sudah digunakan", 409);
      }
    }

    if (validatedData.categoryId) {
      const category = await prisma.medicineCategory.findUnique({
        where: {
          id: validatedData.categoryId,
        },
      });

      if (!category || !category.isActive) {
        return errorResponse("Kategori tidak valid", 400);
      }
    }

    if (validatedData.unitId) {
      const unit = await prisma.medicineUnit.findUnique({
        where: {
          id: validatedData.unitId,
        },
      });

      if (!unit || !unit.isActive) {
        return errorResponse("Satuan tidak valid", 400);
      }
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        categoryId: validatedData.categoryId,
        unitId: validatedData.unitId,
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description,
        minimumStock: validatedData.minimumStock,
        isActive: validatedData.isActive,
      },
      include: {
        category: true,
        unit: true,
      },
    });

    await createAuditLog({
      request,
      action: "medicines.update",
      resourceType: "medicines",
      resourceId: id,
      oldData: existingMedicine,
      newData: medicine,
    });

    return successResponse(medicine, "Obat berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui obat");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
      },
    });

    if (!medicine) {
      return errorResponse("Obat tidak ditemukan", 404);
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        isActive: false,
      },
      include: {
        category: true,
        unit: true,
      },
    });

    await createAuditLog({
      request,
      action: "medicines.deactivate",
      resourceType: "medicines",
      resourceId: id,
      oldData: medicine,
      newData: updatedMedicine,
    });

    return successResponse(null, "Obat berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan obat");
  }
}
