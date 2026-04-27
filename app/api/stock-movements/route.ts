import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        type ? { type: type as "IN" | "OUT" | "ADJUSTMENT" } : {},
        search
          ? {
              OR: [
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
                {
                  batch: {
                    batchNumber: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  referenceType: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  notes: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [stockMovements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
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
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return successResponse({
      stockMovements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data kartu stok");
  }
}
