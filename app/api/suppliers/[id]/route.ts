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

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().email("Format email tidak valid").optional());

const updateSupplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter").optional(),
  phone: z.string().optional().nullable(),
  email: optionalEmailSchema,
  address: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return errorResponse("Supplier tidak ditemukan", 404);
    }

    return successResponse(supplier);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail supplier");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSupplierSchema.parse(body);

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return errorResponse("Supplier tidak ditemukan", 404);
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email:
          validatedData.email === undefined ? undefined : validatedData.email,
        address: validatedData.address,
        isActive: validatedData.isActive,
      },
    });

    await createAuditLog({
      request,
      action: "suppliers.update",
      resourceType: "suppliers",
      resourceId: id,
      oldData: existingSupplier,
      newData: supplier,
    });

    return successResponse(supplier, "Supplier berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui supplier");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return errorResponse("Supplier tidak ditemukan", 404);
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await createAuditLog({
      request,
      action: "suppliers.deactivate",
      resourceType: "suppliers",
      resourceId: id,
      oldData: supplier,
      newData: updatedSupplier,
    });

    return successResponse(null, "Supplier berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan supplier");
  }
}
