import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";

const createPurchaseSchema = z.object({
  supplierId: z.string().uuid("Supplier tidak valid"),
  purchaseDate: z.string().min(1, "Tanggal pembelian wajib diisi"),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        medicineId: z.string().uuid("Obat tidak valid"),
        batchNumber: z.string().min(1, "Batch number wajib diisi"),
        expiredDate: z.string().min(1, "Expired date wajib diisi"),
        quantity: z.number().int().min(1, "Quantity minimal 1"),
        purchasePrice: z.number().min(0, "Harga beli minimal 0"),
        sellingPrice: z.number().min(0, "Harga jual minimal 0"),
      }),
    )
    .min(1, "Minimal 1 item pembelian"),
});

function buildInvoiceNumber(sequence: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `PUR-${year}${month}-${String(sequence).padStart(4, "0")}`;
}

async function generatePurchaseInvoiceNumber(tx: typeof prisma) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `PUR-${year}${month}-`;

  const lastPurchase = await tx.purchase.findFirst({
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

  const lastSequence = lastPurchase?.invoiceNumber
    ? Number(lastPurchase.invoiceNumber.split("-").at(-1) || 0)
    : 0;

  return buildInvoiceNumber(lastSequence + 1);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const supplierId = searchParams.get("supplierId") || "";

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
                  supplier: {
                    name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
            }
          : {},
        supplierId ? { supplierId } : {},
      ],
    };

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
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
            },
          },
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    return successResponse({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengambil data pembelian");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validatedData = createPurchaseSchema.parse(body);

    const supplier = await prisma.supplier.findUnique({
      where: { id: validatedData.supplierId },
    });

    if (!supplier || !supplier.isActive) {
      return errorResponse("Supplier tidak valid", 400);
    }

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

    const totalAmount = validatedData.items.reduce((total, item) => {
      return total + item.quantity * item.purchasePrice;
    }, 0);

    const purchase = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generatePurchaseInvoiceNumber(
        tx as typeof prisma,
      );

      const createdPurchase = await tx.purchase.create({
        data: {
          supplierId: validatedData.supplierId,
          userId: session.user.id,
          invoiceNumber,
          purchaseDate: new Date(validatedData.purchaseDate),
          notes: validatedData.notes || null,
          totalAmount,
        },
      });

      for (const item of validatedData.items) {
        const subtotal = item.quantity * item.purchasePrice;

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: createdPurchase.id,
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            expiredDate: new Date(item.expiredDate),
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            sellingPrice: item.sellingPrice,
            subtotal,
          },
        });

        const existingBatch = await tx.medicineBatch.findFirst({
          where: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
          },
        });

        let batch;

        if (existingBatch) {
          const stockBefore = existingBatch.currentQuantity;
          const stockAfter = stockBefore + item.quantity;

          batch = await tx.medicineBatch.update({
            where: { id: existingBatch.id },
            data: {
              initialQuantity: existingBatch.initialQuantity + item.quantity,
              currentQuantity: stockAfter,
              expiredDate: new Date(item.expiredDate),
              purchasePrice: item.purchasePrice,
              sellingPrice: item.sellingPrice,
            },
          });

          await tx.stockMovement.create({
            data: {
              medicineId: item.medicineId,
              medicineBatchId: batch.id,
              userId: session.user.id,
              type: "IN",
              quantity: item.quantity,
              stockBefore,
              stockAfter,
              referenceType: "purchases",
              referenceId: createdPurchase.id,
              notes: `Pembelian ${createdPurchase.invoiceNumber}`,
            },
          });
        } else {
          batch = await tx.medicineBatch.create({
            data: {
              medicineId: item.medicineId,
              batchNumber: item.batchNumber,
              expiredDate: new Date(item.expiredDate),
              initialQuantity: item.quantity,
              currentQuantity: item.quantity,
              purchasePrice: item.purchasePrice,
              sellingPrice: item.sellingPrice,
            },
          });

          await tx.stockMovement.create({
            data: {
              medicineId: item.medicineId,
              medicineBatchId: batch.id,
              userId: session.user.id,
              type: "IN",
              quantity: item.quantity,
              stockBefore: 0,
              stockAfter: item.quantity,
              referenceType: "purchases",
              referenceId: createdPurchase.id,
              notes: `Pembelian ${createdPurchase.invoiceNumber}`,
            },
          });
        }

        await tx.purchaseItem.update({
          where: { id: purchaseItem.id },
          data: {
            medicineBatchId: batch.id,
          },
        });
      }

      return tx.purchase.findUnique({
        where: { id: createdPurchase.id },
        include: {
          supplier: true,
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
    });

    await createAuditLog({
      request,
      action: "purchases.create",
      resourceType: "purchases",
      resourceId: purchase?.id,
      newData: purchase,
    });

    return successResponse(purchase, "Pembelian berhasil dibuat", 201);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Validasi gagal", 422);
    }

    return errorResponse("Gagal membuat pembelian");
  }
}
