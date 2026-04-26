import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const createStockAdjustmentSchema = z.object({
  medicineId: z.string().uuid("Medicine tidak valid"),
  medicineBatchId: z.string().uuid("Batch tidak valid"),
  adjustmentType: z.enum(["EXPIRED", "DAMAGE", "LOSS", "CORRECTION", "OTHER"]),
  quantity: z.number().int().min(1, "Quantity minimal 1"),
  reason: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validatedData = createStockAdjustmentSchema.parse(body);

    const batch = await prisma.medicineBatch.findUnique({
      where: {
        id: validatedData.medicineBatchId,
      },
      include: {
        medicine: true,
      },
    });

    if (!batch) {
      return errorResponse("Batch tidak ditemukan", 404);
    }

    if (batch.medicineId !== validatedData.medicineId) {
      return errorResponse("Batch tidak sesuai dengan obat", 400);
    }

    if (validatedData.quantity > batch.currentQuantity) {
      return errorResponse("Quantity melebihi stock batch saat ini", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const stockBefore = batch.currentQuantity;
      const stockAfter = stockBefore - validatedData.quantity;

      const adjustment = await tx.stockAdjustment.create({
        data: {
          medicineId: validatedData.medicineId,
          medicineBatchId: validatedData.medicineBatchId,
          userId: session.user.id,
          adjustmentType: validatedData.adjustmentType,
          quantity: validatedData.quantity,
          reason: validatedData.reason || null,
        },
      });

      const updatedBatch = await tx.medicineBatch.update({
        where: {
          id: validatedData.medicineBatchId,
        },
        data: {
          currentQuantity: stockAfter,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          medicineId: validatedData.medicineId,
          medicineBatchId: validatedData.medicineBatchId,
          userId: session.user.id,
          type: "ADJUSTMENT",
          quantity: validatedData.quantity,
          stockBefore,
          stockAfter,
          referenceType: "stock_adjustments",
          referenceId: adjustment.id,
          notes: validatedData.reason || validatedData.adjustmentType,
        },
      });

      return {
        adjustment,
        updatedBatch,
        movement,
      };
    });

    await createAuditLog({
      request,
      action: "stock_adjustments.create",
      resourceType: "stock_adjustments",
      resourceId: result.adjustment.id,
      newData: result,
    });

    return successResponse(result, "Stock adjustment berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat stock adjustment");
  }
}
