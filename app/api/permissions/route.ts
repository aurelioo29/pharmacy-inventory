import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });

    return successResponse({ permissions });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data permissions");
  }
}
