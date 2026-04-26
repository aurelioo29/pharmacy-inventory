import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = {
  params: Promise<{
    medicineId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { medicineId } = await params;

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: {
        category: true,
        unit: true,
        batches: {
          orderBy: {
            expiredDate: "asc",
          },
        },
        stockMovements: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            batch: true,
          },
        },
      },
    });

    if (!medicine) {
      return errorResponse("Obat tidak ditemukan", 404);
    }

    const totalStock = medicine.batches.reduce(
      (sum, batch) => sum + batch.currentQuantity,
      0,
    );

    return successResponse({
      medicine,
      totalStock,
      batches: medicine.batches,
      movements: medicine.stockMovements,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail stock");
  }
}
