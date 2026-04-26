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

const updateUnitSchema = z.object({
  name: z.string().min(1, "Nama satuan wajib diisi").optional(),
  symbol: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const unit = await prisma.medicineUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      return errorResponse("Satuan tidak ditemukan", 404);
    }

    return successResponse(unit);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail satuan");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUnitSchema.parse(body);

    const existingUnit = await prisma.medicineUnit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return errorResponse("Satuan tidak ditemukan", 404);
    }

    const unit = await prisma.medicineUnit.update({
      where: { id },
      data: {
        name: validatedData.name,
        symbol: validatedData.symbol,
        isActive: validatedData.isActive,
      },
    });

    await createAuditLog({
      request,
      action: "units.update",
      resourceType: "units",
      resourceId: id,
      oldData: existingUnit,
      newData: unit,
    });

    return successResponse(unit, "Satuan berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui satuan");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const unit = await prisma.medicineUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      return errorResponse("Satuan tidak ditemukan", 404);
    }

    const updatedUnit = await prisma.medicineUnit.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await createAuditLog({
      request,
      action: "units.deactivate",
      resourceType: "units",
      resourceId: id,
      oldData: unit,
      newData: updatedUnit,
    });

    return successResponse(null, "Satuan berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan satuan");
  }
}
