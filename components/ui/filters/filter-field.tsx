type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
  span?: string;
};

export default function FilterField({
  label,
  children,
  span = "md:col-span-4",
}: FilterFieldProps) {
  return (
    <div className={span}>
      <label className="mb-1 block text-md font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}
