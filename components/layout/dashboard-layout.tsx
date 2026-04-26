"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, Layout, Typography } from "antd";
import type { Session } from "next-auth";
import DashboardHeader from "./dashboard-header";
import DashboardSidebar from "./dashboard-sidebar";
import { getDashboardMenuItems } from "./dashboard-menu";

const { Text } = Typography;

type DashboardLayoutProps = {
  children: React.ReactNode;
  session: Session;
  title?: string;
  breadcrumbs?: {
    title: string;
    href?: string;
  }[];
  description?: string;
};

export default function DashboardLayout({
  children,
  session,
  title = "Dashboard",
  breadcrumbs = [],
  description = "",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = useMemo(() => getDashboardMenuItems(session), [session]);

  return (
    <Layout className="min-h-screen !bg-[#eef2f6]">
      <DashboardHeader session={session} />

      <Layout className="!bg-[#eef2f6]">
        <DashboardSidebar
          collapsed={collapsed}
          selectedKey={pathname}
          menuItems={menuItems}
          onToggle={() => setCollapsed((value) => !value)}
        />

        <Layout className="min-h-[calc(100vh-64px)] !bg-[#eef2f6]">
          <div className="border-b border-slate-200 bg-white px-5 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h1 className="m-0 min-w-fit text-sm font-bold text-slate-900">
                {title}
              </h1>

              <Breadcrumb
                className="text-xs"
                items={[
                  {
                    title: <Link href="/dashboard">Home</Link>,
                  },
                  ...breadcrumbs.map((item) => ({
                    title: item.href ? (
                      <Link href={item.href}>{item.title}</Link>
                    ) : (
                      item.title
                    ),
                  })),
                ]}
              />
            </div>

            {description && (
              <Text type="secondary" className="mt-1 block !text-[11px]">
                {description}
              </Text>
            )}
          </div>

          <Layout.Content className="min-h-[calc(100vh-105px)] bg-[#eef2f6] px-5 py-5">
            {children}
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
