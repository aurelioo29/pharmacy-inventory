import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-log";

const updatePurchaseSchema = z.object({
  purchaseDate: z.string().min(1, "Tanggal pembelian wajib diisi").optional(),
  notes: z.string().optional().nullable(),
});

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            batch: true,
          },
        },
      },
    });

    if (!purchase) {
      return errorResponse("Pembelian tidak ditemukan", 404);
    }

    return successResponse(purchase);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail pembelian");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePurchaseSchema.parse(body);

    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    if (!existingPurchase) {
      return errorResponse("Pembelian tidak ditemukan", 404);
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : undefined,
        notes: validatedData.notes,
      },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    await createAuditLog({
      request,
      action: "purchases.update",
      resourceType: "purchases",
      resourceId: id,
      oldData: existingPurchase,
      newData: purchase,
    });

    return successResponse(purchase, "Pembelian berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui pembelian");
  }
}
