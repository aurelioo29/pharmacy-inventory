import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { Medicine } from "../types/medicine";

type MedicineInfoTableProps = {
  medicine: Medicine;
};

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-";
}

function Value({ children }: { children: ReactNode }) {
  return <div className="text-sm text-slate-800">{children || "-"}</div>;
}

export default function MedicineInfoTable({
  medicine,
}: MedicineInfoTableProps) {
  const rows: [string, ReactNode][] = [
    ["Code", medicine.code],
    ["Name", medicine.name],
    ["Category", medicine.category?.name || "-"],
    ["Unit", medicine.unit?.symbol || medicine.unit?.name || "-"],
    ["Minimum Stock", medicine.minimumStock],
    ["Description", medicine.description || "-"],
    [
      "Status",
      <span
        key="status"
        className={
          medicine.isActive
            ? "font-semibold text-green-600"
            : "font-semibold text-red-600"
        }
      >
        {medicine.isActive ? "Aktif" : "Nonaktif"}
      </span>,
    ],
    ["Created at", formatDate(medicine.createdAt)],
    ["Last updated at", formatDate(medicine.updatedAt)],
  ];

  return (
    <div className="border border-slate-200">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_1fr]"
        >
          <div className="bg-slate-50 px-4 py-3 text-md text-slate-600">
            {label}
          </div>

          <div className="px-4 py-3">
            <Value>{value}</Value>
          </div>
        </div>
      ))}
    </div>
  );
}
