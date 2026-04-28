"use client";

import { Button, Skeleton } from "antd";
import dayjs from "dayjs";
import { ArrowLeft, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSale } from "../hooks/use-sales";

type SaleReceiptPageProps = {
  saleId: string;
};

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function SaleReceiptPage({ saleId }: SaleReceiptPageProps) {
  const router = useRouter();
  const saleQuery = useSale(saleId);

  const sale = saleQuery.data?.data;

  if (saleQuery.isLoading || !sale) {
    return <Skeleton active />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[420px] justify-between gap-3 print:hidden">
        <Button
          icon={<ArrowLeft size={15} />}
          onClick={() => router.push(`/transactions/sales/${saleId}`)}
        >
          Back
        </Button>

        <Button
          type="primary"
          icon={<Printer size={15} />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>

      <div className="mx-auto max-w-[420px] bg-white p-6 text-sm text-slate-900 shadow print:max-w-none print:shadow-none">
        <div className="text-center">
          <div className="text-lg font-bold">Pharmacy Inventory</div>
          <div className="text-xs text-slate-500">
            Sales Receipt / Struk Penjualan
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Invoice</span>
            <span className="font-semibold">{sale.invoiceNumber}</span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>
            <span>{dayjs(sale.saleDate).format("DD-MM-YYYY")}</span>
          </div>

          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{sale.user?.username || "-"}</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-3">
          {sale.items?.map((item: any) => (
            <div key={item.id}>
              <div className="font-semibold">
                {item.medicine?.code} - {item.medicine?.name}
              </div>

              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>
                  {item.quantity} x Rp {formatMoney(item.sellingPrice)}
                </span>
                <span className="font-semibold text-slate-900">
                  Rp {formatMoney(item.subtotal)}
                </span>
              </div>

              <div className="mt-1 text-[11px] text-slate-400">
                Batch: {item.batch?.batchNumber || "-"}
              </div>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="text-base font-bold">
              Rp {formatMoney(sale.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Paid</span>
            <span>Rp {formatMoney(sale.paidAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Change</span>
            <span className="font-bold text-green-600">
              Rp {formatMoney(sale.changeAmount)}
            </span>
          </div>
        </div>

        {sale.notes && (
          <>
            <div className="my-4 border-t border-dashed border-slate-300" />
            <div className="text-xs">
              <div className="font-semibold">Notes</div>
              <div className="text-slate-600">{sale.notes}</div>
            </div>
          </>
        )}

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="text-center text-xs text-slate-500">Terima kasih</div>
      </div>
    </div>
  );
}
