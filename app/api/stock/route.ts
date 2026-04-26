import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

function getStockStatus(totalStock: number, minimumStock: number) {
  if (totalStock <= 0) return "OUT_OF_STOCK";
  if (totalStock <= minimumStock) return "LOW_STOCK";
  return "SAFE";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const medicines = await prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
        batches: {
          select: {
            currentQuantity: true,
          },
        },
      },
    });

    const total = await prisma.medicine.count({ where });

    const stocks = medicines
      .map((medicine) => {
        const totalStock = medicine.batches.reduce(
          (sum, batch) => sum + batch.currentQuantity,
          0,
        );

        const stockStatus = getStockStatus(totalStock, medicine.minimumStock);

        return {
          id: medicine.id,
          code: medicine.code,
          name: medicine.name,
          minimumStock: medicine.minimumStock,
          isActive: medicine.isActive,
          category: medicine.category,
          unit: medicine.unit,
          totalStock,
          stockStatus,
        };
      })
      .filter((item) => (status ? item.stockStatus === status : true));

    return successResponse({
      stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data stock");
  }
}
