type InfoTableProps = {
  data: [string, React.ReactNode][];
};

export default function InfoTable({ data }: InfoTableProps) {
  return (
    <div className="border border-slate-200">
      {data.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_1fr]"
        >
          <div className="bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {label}
          </div>

          <div className="px-4 py-3 text-sm text-slate-800">{value || "-"}</div>
        </div>
      ))}
    </div>
  );
}
