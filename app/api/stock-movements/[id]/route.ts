import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const stockMovement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        medicine: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiredDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!stockMovement) {
      return errorResponse("Kartu stok tidak ditemukan", 404);
    }

    return successResponse(stockMovement);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail kartu stok");
  }
}
