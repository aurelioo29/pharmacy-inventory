import { Avatar, Layout } from "antd";
import type { Session } from "next-auth";
import { Boxes, UserRound } from "lucide-react";
import LogoutButton from "./logout-button";

type DashboardHeaderProps = {
  session: Session;
};

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  return (
    <Layout.Header className="!sticky !top-0 !z-30 !flex !h-[64px] !items-center !justify-between !border-b !border-slate-200 !bg-white !px-5 !leading-none">
      <div className="flex min-w-[260px] items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-600 text-white">
          <Boxes size={18} strokeWidth={2} />
        </div>

        <div>
          <div className="text-sm font-bold leading-tight text-slate-900">
            Pharmacy Inventory
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-slate-500">
            Stock Management System
          </div>
        </div>
      </div>

      <div className="flex h-full items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold leading-tight text-slate-900">
            {session.user.name}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase leading-tight text-slate-400">
            {session.user.roles?.join(", ")}
          </div>
        </div>

        <Avatar
          size={34}
          className="!bg-slate-100 !text-slate-700"
          icon={<UserRound size={16} />}
        />

        <LogoutButton />
      </div>
    </Layout.Header>
  );
}
