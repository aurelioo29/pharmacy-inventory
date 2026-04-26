type SaleItemStockInfo = {
  medicineId?: string;
};

type MedicineStockInfo = {
  id: string;
  code: string;
  name: string;
  totalStock?: number | null;
  minimumStock?: number | null;
  batches?: {
    currentQuantity: number;
  }[];
};

type Props = {
  items: SaleItemStockInfo[];
  medicines: MedicineStockInfo[];
};

export default function StockInfoPanel({ items, medicines }: Props) {
  const selectedMedicineIds = items
    .map((item) => item.medicineId)
    .filter((id): id is string => Boolean(id));

  const uniqueSelectedMedicineIds = Array.from(new Set(selectedMedicineIds));

  const selectedMedicines = medicines.filter((medicine) =>
    uniqueSelectedMedicineIds.includes(medicine.id),
  );

  return (
    <div className="w-full max-w-[350px] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-md text-center uppercase font-bold text-slate-800">
        Stock Info
      </div>

      <div className="text-sm">
        {selectedMedicines.length === 0 ? (
          <div className="px-4 py-3 text-slate-400">Belum ada obat dipilih</div>
        ) : (
          selectedMedicines.map((medicine, index) => {
            const totalStock =
              medicine.totalStock ??
              medicine.batches?.reduce(
                (sum, batch) => sum + Number(batch.currentQuantity || 0),
                0,
              ) ??
              0;

            const minimumStock = Number(medicine.minimumStock || 0);
            const isLowStock = totalStock <= minimumStock;

            return (
              <div
                key={medicine.id}
                className={[
                  "grid grid-cols-[1fr_80px] items-center px-4 py-3",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50",
                ].join(" ")}
              >
                <div className="truncate text-slate-700">
                  {medicine.code} - {medicine.name}
                </div>

                <div
                  className={
                    isLowStock
                      ? "text-right font-bold text-red-600"
                      : "text-right font-bold text-green-600"
                  }
                >
                  {totalStock}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
