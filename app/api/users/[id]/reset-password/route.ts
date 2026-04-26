import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const RESET_PASSWORD_PIN = "112233";
const DEFAULT_RESET_PASSWORD = "password";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.pin !== RESET_PASSWORD_PIN) {
      return errorResponse("PIN confirmation salah", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    const passwordHash = await bcrypt.hash(DEFAULT_RESET_PASSWORD, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      request,
      action: "users.reset_password",
      resourceType: "users",
      resourceId: id,
      oldData: {
        id: user.id,
        username: user.username,
      },
      newData: {
        ...updatedUser,
        defaultPassword: DEFAULT_RESET_PASSWORD,
      },
    });

    return successResponse(
      {
        defaultPassword: DEFAULT_RESET_PASSWORD,
      },
      "Password berhasil direset",
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal reset password");
  }
}
