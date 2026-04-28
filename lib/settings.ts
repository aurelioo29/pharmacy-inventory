import { prisma } from "@/lib/prisma";

export async function getSettingValue(key: string, fallback = "") {
  const setting = await prisma.setting.findUnique({
    where: { key },
    select: { value: true },
  });

  return setting?.value || fallback;
}

export async function getNumberSetting(key: string, fallback = 0) {
  const value = await getSettingValue(key, String(fallback));
  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? fallback : numberValue;
}

export async function getSystemSettings() {
  const settings = await prisma.setting.findMany();

  const map = new Map(settings.map((setting) => [setting.key, setting.value]));

  return {
    storeName: map.get("store_name") || "Pharmacy Inventory",
    currency: map.get("currency") || "IDR",
    expiredWarningDays: Number(map.get("expired_warning_days") || 30),
    purchaseInvoicePrefix: map.get("invoice_prefix_purchase") || "PUR",
    saleInvoicePrefix: map.get("invoice_prefix_sale") || "SAL",
    receiptFooter: map.get("receipt_footer") || "Terima kasih",
  };
}
