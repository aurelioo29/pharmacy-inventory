import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getNumberSetting } from "@/lib/settings";

type ExpiredStatus = "EXPIRED" | "EXPIRING_SOON";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDaysLeft(expiredDate: Date) {
  const today = startOfToday();
  const expired = new Date(expiredDate);
  expired.setHours(0, 0, 0, 0);

  const diff = expired.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiredStatus(expiredDate: Date): ExpiredStatus {
  const daysLeft = getDaysLeft(expiredDate);

  if (daysLeft < 0) return "EXPIRED";

  return "EXPIRING_SOON";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const thresholdDays =
      Number(searchParams.get("thresholdDays")) ||
      (await getNumberSetting("expired_warning_days", 30));

    const skip = (page - 1) * limit;

    const today = startOfToday();
    const thresholdDate = addDays(today, thresholdDays);

    const expiredDateFilter =
      status === "EXPIRED"
        ? {
            lt: today,
          }
        : status === "EXPIRING_SOON"
          ? {
              gte: today,
              lte: thresholdDate,
            }
          : {
              lte: thresholdDate,
            };

    const where = {
      AND: [
        {
          currentQuantity: {
            gt: 0,
          },
        },
        {
          expiredDate: expiredDateFilter,
        },
        search
          ? {
              OR: [
                {
                  batchNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  medicine: {
                    code: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  medicine: {
                    name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [batches, total] = await Promise.all([
      prisma.medicineBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          expiredDate: "asc",
        },
        include: {
          medicine: {
            select: {
              id: true,
              code: true,
              name: true,
              minimumStock: true,
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
            },
          },
        },
      }),
      prisma.medicineBatch.count({
        where,
      }),
    ]);

    const expiredMedicines = batches.map((batch) => {
      const daysLeft = getDaysLeft(batch.expiredDate);

      return {
        id: batch.id,
        medicineId: batch.medicineId,
        batchNumber: batch.batchNumber,
        expiredDate: batch.expiredDate,
        currentQuantity: batch.currentQuantity,
        initialQuantity: batch.initialQuantity,
        purchasePrice: batch.purchasePrice,
        sellingPrice: batch.sellingPrice,
        daysLeft,
        status: getExpiredStatus(batch.expiredDate),
        medicine: batch.medicine,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      };
    });

    return successResponse({
      expiredMedicines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data obat kadaluarsa");
  }
}
