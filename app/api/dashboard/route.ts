import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(_: NextRequest) {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const expiredThresholdDate = addDays(todayStart, 30);

    const last7DaysStart = startOfDay(addDays(todayStart, -6));

    const [
      totalMedicines,
      batches,
      expiredCount,
      expiringSoonCount,
      todaySalesAggregate,
      todayPurchasesAggregate,
      recentSales,
      recentStockMovements,
      lowStockMedicines,
    ] = await Promise.all([
      prisma.medicine.count({
        where: {
          isActive: true,
        },
      }),

      prisma.medicineBatch.findMany({
        select: {
          currentQuantity: true,
        },
      }),

      prisma.medicineBatch.count({
        where: {
          currentQuantity: {
            gt: 0,
          },
          expiredDate: {
            lt: todayStart,
          },
        },
      }),

      prisma.medicineBatch.count({
        where: {
          currentQuantity: {
            gt: 0,
          },
          expiredDate: {
            gte: todayStart,
            lte: expiredThresholdDate,
          },
        },
      }),

      prisma.sale.aggregate({
        where: {
          saleDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.purchase.aggregate({
        where: {
          purchaseDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.sale.findMany({
        where: {
          saleDate: {
            gte: last7DaysStart,
            lte: todayEnd,
          },
        },
        select: {
          saleDate: true,
          totalAmount: true,
        },
        orderBy: {
          saleDate: "asc",
        },
      }),

      prisma.stockMovement.findMany({
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          medicine: {
            select: {
              code: true,
              name: true,
            },
          },
          batch: {
            select: {
              batchNumber: true,
            },
          },
          user: {
            select: {
              username: true,
            },
          },
        },
      }),

      prisma.medicine.findMany({
        where: {
          isActive: true,
        },
        include: {
          batches: {
            select: {
              currentQuantity: true,
            },
          },
          unit: {
            select: {
              symbol: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalStock = batches.reduce(
      (total, batch) => total + batch.currentQuantity,
      0,
    );

    const lowStock = lowStockMedicines
      .map((medicine) => {
        const total = medicine.batches.reduce(
          (sum, batch) => sum + batch.currentQuantity,
          0,
        );

        return {
          id: medicine.id,
          code: medicine.code,
          name: medicine.name,
          minimumStock: medicine.minimumStock,
          totalStock: total,
          unit: medicine.unit,
        };
      })
      .filter((medicine) => medicine.totalStock <= medicine.minimumStock)
      .slice(0, 8);

    const salesChartMap = new Map<string, number>();

    for (let index = 0; index < 7; index += 1) {
      const date = addDays(last7DaysStart, index);
      salesChartMap.set(formatDateKey(date), 0);
    }

    recentSales.forEach((sale) => {
      const key = formatDateKey(sale.saleDate);
      salesChartMap.set(
        key,
        (salesChartMap.get(key) || 0) + Number(sale.totalAmount),
      );
    });

    const salesChart = Array.from(salesChartMap.entries()).map(
      ([date, total]) => ({
        date,
        total,
      }),
    );

    return successResponse({
      summary: {
        totalMedicines,
        totalStock,
        lowStockCount: lowStock.length,
        expiredCount,
        expiringSoonCount,
        todaySales: Number(todaySalesAggregate._sum.totalAmount || 0),
        todayPurchases: Number(todayPurchasesAggregate._sum.totalAmount || 0),
      },
      salesChart,
      lowStock,
      recentStockMovements,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data dashboard");
  }
}
