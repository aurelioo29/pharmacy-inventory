import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";
import { getSettingValue } from "@/lib/settings";

const createSaleSchema = z.object({
  saleDate: z.string().min(1, "Tanggal penjualan wajib diisi"),
  paidAmount: z.number().min(0, "Jumlah bayar minimal 0"),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        medicineId: z.string().uuid("Obat tidak valid"),
        quantity: z.number().int().min(1, "Quantity minimal 1"),
      }),
    )
    .min(1, "Minimal 1 item penjualan"),
});

function buildInvoiceNumber(sequence: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `SAL-${year}${month}-${String(sequence).padStart(4, "0")}`;
}

async function generateSaleInvoiceNumber(tx: typeof prisma) {
  const prefixSetting = await getSettingValue("invoice_prefix_sale", "SAL");

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${prefixSetting}-${year}${month}-`;

  const lastSale = await tx.sale.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
    select: {
      invoiceNumber: true,
    },
  });

  const lastSequence = lastSale?.invoiceNumber
    ? Number(lastSale.invoiceNumber.split("-").at(-1) || 0)
    : 0;

  return `${prefix}${String(lastSequence + 1).padStart(4, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  invoiceNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  user: {
                    username: {
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

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
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
          items: {
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
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return successResponse({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data penjualan");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validatedData = createSaleSchema.parse(body);

    const medicineIds = validatedData.items.map((item) => item.medicineId);

    const medicines = await prisma.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isActive: true,
      },
    });

    if (medicines.length !== new Set(medicineIds).size) {
      return errorResponse("Ada obat yang tidak valid", 400);
    }

    const sale = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateSaleInvoiceNumber(
        tx as typeof prisma,
      );

      const createdSale = await tx.sale.create({
        data: {
          userId: session.user.id,
          invoiceNumber,
          saleDate: new Date(validatedData.saleDate),
          totalAmount: 0,
          paidAmount: validatedData.paidAmount,
          changeAmount: 0,
          notes: validatedData.notes || null,
        },
      });

      let totalAmount = 0;

      for (const item of validatedData.items) {
        let remainingQuantity = item.quantity;

        const medicine = medicines.find((med) => med.id === item.medicineId);

        if (!medicine) {
          throw new Error("Obat tidak valid");
        }

        const availableBatches = await tx.medicineBatch.findMany({
          where: {
            medicineId: item.medicineId,
            currentQuantity: {
              gt: 0,
            },
          },
          orderBy: {
            expiredDate: "asc",
          },
        });

        const totalAvailableStock = availableBatches.reduce(
          (total, batch) => total + batch.currentQuantity,
          0,
        );

        if (totalAvailableStock < item.quantity) {
          throw new Error(
            `Stok ${medicine.name} tidak cukup. Tersedia: ${totalAvailableStock}`,
          );
        }

        for (const batch of availableBatches) {
          if (remainingQuantity <= 0) break;

          const takenQuantity = Math.min(
            remainingQuantity,
            batch.currentQuantity,
          );

          const stockBefore = batch.currentQuantity;
          const stockAfter = stockBefore - takenQuantity;
          const sellingPrice = Number(batch.sellingPrice);
          const subtotal = takenQuantity * sellingPrice;

          await tx.saleItem.create({
            data: {
              saleId: createdSale.id,
              medicineId: item.medicineId,
              medicineBatchId: batch.id,
              quantity: takenQuantity,
              sellingPrice,
              subtotal,
            },
          });

          await tx.medicineBatch.update({
            where: {
              id: batch.id,
            },
            data: {
              currentQuantity: stockAfter,
            },
          });

          await tx.stockMovement.create({
            data: {
              medicineId: item.medicineId,
              medicineBatchId: batch.id,
              userId: session.user.id,
              type: "OUT",
              quantity: takenQuantity,
              stockBefore,
              stockAfter,
              referenceType: "sales",
              referenceId: createdSale.id,
              notes: `Penjualan ${createdSale.invoiceNumber}`,
            },
          });

          totalAmount += subtotal;
          remainingQuantity -= takenQuantity;
        }
      }

      if (validatedData.paidAmount < totalAmount) {
        throw new Error("Jumlah bayar kurang dari total penjualan");
      }

      const updatedSale = await tx.sale.update({
        where: {
          id: createdSale.id,
        },
        data: {
          totalAmount,
          changeAmount: validatedData.paidAmount - totalAmount,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          items: {
            include: {
              medicine: true,
              batch: true,
            },
          },
        },
      });

      return updatedSale;
    });

    await createAuditLog({
      request,
      action: "sales.create",
      resourceType: "sales",
      resourceId: sale.id,
      newData: sale,
    });

    return successResponse(sale, "Penjualan berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse("Gagal membuat penjualan");
  }
}
