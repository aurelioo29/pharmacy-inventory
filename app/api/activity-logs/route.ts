import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const resourceType = searchParams.get("resourceType") || "";
    const action = searchParams.get("action") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { action: { contains: search, mode: "insensitive" as const } },
                {
                  resourceType: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  ipAddress: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  user: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        username: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              ],
            }
          : {},
        resourceType ? { resourceType } : {},
        action ? { action } : {},
      ],
    };

    const [activityLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse({
      activityLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil activity logs");
  }
}
