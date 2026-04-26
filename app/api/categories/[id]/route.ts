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

const updateCategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").optional(),
  slug: z.string().min(2, "Slug minimal 2 karakter").optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.medicineCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return errorResponse("Kategori tidak ditemukan", 404);
    }

    return successResponse(category);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail kategori");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const existingCategory = await prisma.medicineCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return errorResponse("Kategori tidak ditemukan", 404);
    }

    if (validatedData.slug) {
      const duplicateSlug = await prisma.medicineCategory.findFirst({
        where: {
          id: { not: id },
          slug: validatedData.slug,
        },
      });

      if (duplicateSlug) {
        return errorResponse("Slug sudah digunakan", 409);
      }
    }

    const category = await prisma.medicineCategory.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
    });

    await createAuditLog({
      request,
      action: "categories.update",
      resourceType: "categories",
      resourceId: id,
      oldData: existingCategory,
      newData: category,
    });

    return successResponse(category, "Kategori berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui kategori");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.medicineCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return errorResponse("Kategori tidak ditemukan", 404);
    }

    const updatedCategory = await prisma.medicineCategory.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await createAuditLog({
      request,
      action: "categories.deactivate",
      resourceType: "categories",
      resourceId: id,
      oldData: category,
      newData: updatedCategory,
    });

    return successResponse(null, "Kategori berhasil dinonaktifkan");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menonaktifkan kategori");
  }
}
