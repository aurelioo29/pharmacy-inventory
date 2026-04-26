import dayjs from "dayjs";
import type { User } from "../types/user";

type UserInfoTableProps = {
  user: User;
};

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-";
}

function Value({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-slate-800">{children || "-"}</div>;
}

export default function UserInfoTable({ user }: UserInfoTableProps) {
  const roles = user.roles.map((item) => item.role.name).join(", ");

  const rows: [string, React.ReactNode][] = [
    ["Username", user.username],
    ["Name", user.name],
    ["Email", user.email || "-"],
    ["Role List", roles || "-"],
    ["Birth Place", user.birthPlace || "-"],
    [
      "Birth Date",
      user.birthDate ? dayjs(user.birthDate).format("DD-MM-YYYY") : "-",
    ],
    ["Religion", user.religion || "-"],
    ["Education", user.education || "-"],
    ["Blood Type", user.bloodType || "-"],
    ["Marital Status", user.maritalStatus || "-"],
    ["Gender", user.gender || "-"],
    [
      "Status",
      <span
        key="status"
        className={
          user.isActive
            ? "font-semibold text-green-600"
            : "font-semibold text-red-600"
        }
      >
        {user.isActive ? "Aktif" : "Nonaktif"}
      </span>,
    ],
    ["Last Login", formatDate(user.lastLoginAt)],
    ["Created at", formatDate(user.createdAt)],
    ["Last updated at", formatDate(user.updatedAt)],
  ];

  return (
    <div className="border border-slate-200">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-2 border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_1fr]"
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
