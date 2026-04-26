import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { Supplier } from "../types/supplier";

type SupplierInfoTableProps = {
  supplier: Supplier;
};

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-";
}

function Value({ children }: { children: ReactNode }) {
  return <div className="text-sm text-slate-800">{children || "-"}</div>;
}

export default function SupplierInfoTable({
  supplier,
}: SupplierInfoTableProps) {
  const rows: [string, ReactNode][] = [
    ["Name", supplier.name],
    ["Phone", supplier.phone || "-"],
    ["Email", supplier.email || "-"],
    ["Address", supplier.address || "-"],
    [
      "Status",
      <span
        key="status"
        className={
          supplier.isActive
            ? "font-semibold text-green-600"
            : "font-semibold text-red-600"
        }
      >
        {supplier.isActive ? "Aktif" : "Nonaktif"}
      </span>,
    ],
    ["Created at", formatDate(supplier.createdAt)],
    ["Last updated at", formatDate(supplier.updatedAt)],
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
