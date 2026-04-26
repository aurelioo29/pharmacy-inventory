import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const saleInclude = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
  items: {
    orderBy: {
      createdAt: "asc" as const,
    },
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
};

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: saleInclude,
    });

    if (!sale) {
      return errorResponse("Penjualan tidak ditemukan", 404);
    }

    return successResponse(sale);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil detail penjualan");
  }
}
