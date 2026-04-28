import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.string().optional(),
  description: z.string().optional().nullable(),
});

const updateSettingsSchema = z.object({
  settings: z.array(settingSchema).min(1, "Minimal 1 setting wajib dikirim"),
});

const defaultSettings = [
  {
    key: "store_name",
    value: "Pharmacy Inventory",
    type: "string",
    description: "Nama toko/apotek",
  },
  {
    key: "currency",
    value: "IDR",
    type: "string",
    description: "Mata uang sistem",
  },
  {
    key: "expired_warning_days",
    value: "30",
    type: "number",
    description: "Jumlah hari peringatan obat hampir kadaluarsa",
  },
  {
    key: "invoice_prefix_purchase",
    value: "PUR",
    type: "string",
    description: "Prefix invoice pembelian",
  },
  {
    key: "invoice_prefix_sale",
    value: "SAL",
    type: "string",
    description: "Prefix invoice penjualan",
  },
  {
    key: "receipt_footer",
    value: "Terima kasih",
    type: "string",
    description: "Footer struk/invoice",
  },
];

async function ensureDefaultSettings() {
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: {
        key: setting.key,
      },
      update: {},
      create: setting,
    });
  }
}

export async function GET() {
  try {
    await ensureDefaultSettings();

    const settings = await prisma.setting.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return successResponse({
      settings,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data settings");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    const oldSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: validatedData.settings.map((setting) => setting.key),
        },
      },
    });

    const settings = await prisma.$transaction(async (tx) => {
      for (const setting of validatedData.settings) {
        await tx.setting.upsert({
          where: {
            key: setting.key,
          },
          update: {
            value: setting.value,
            type: setting.type || "string",
            description: setting.description,
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type || "string",
            description: setting.description,
          },
        });
      }

      return tx.setting.findMany({
        orderBy: {
          key: "asc",
        },
      });
    });

    await createAuditLog({
      request,
      action: "settings.update",
      resourceType: "settings",
      oldData: oldSettings,
      newData: settings,
    });

    return successResponse({ settings }, "Settings berhasil diperbarui");
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal memperbarui settings");
  }
}
