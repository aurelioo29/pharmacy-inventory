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

    const activityLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!activityLog) {
      return errorResponse("Activity log tidak ditemukan", 404);
    }

    return successResponse(activityLog);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail activity log");
  }
}
