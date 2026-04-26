import Link from "next/link";
import type { MenuProps } from "antd";
import type { Session } from "next-auth";
import {
  Boxes,
  ChartNoAxesColumn,
  CircleGauge,
  CircleAlert,
  ClipboardList,
  KeyRound,
  Package,
  PackageCheck,
  Pill,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Users,
} from "lucide-react";
import { hasAnyPermission } from "@/lib/permissions";

const iconProps = {
  size: 17,
  strokeWidth: 1.8,
};

export function getDashboardMenuItems(session: Session): MenuProps["items"] {
  return [
    hasAnyPermission(session, ["dashboard.view"]) && {
      key: "/dashboard",
      icon: <CircleGauge {...iconProps} />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },

    hasAnyPermission(session, [
      "users.view",
      "roles.view",
      "categories.view",
      "units.view",
      "medicines.view",
      "suppliers.view",
    ]) && {
      key: "master-data",
      icon: <Boxes {...iconProps} />,
      label: "Master Data",
      children: [
        hasAnyPermission(session, ["users.view"]) && {
          key: "/master_data/users",
          icon: <Users {...iconProps} />,
          label: <Link href="/master_data/users">Users</Link>,
        },
        hasAnyPermission(session, ["roles.view"]) && {
          key: "/master_data/roles",
          icon: <KeyRound {...iconProps} />,
          label: <Link href="/master_data/roles">Roles & Permissions</Link>,
        },
        hasAnyPermission(session, ["categories.view"]) && {
          key: "/master_data/categories",
          icon: <Tags {...iconProps} />,
          label: <Link href="/master_data/categories">Kategori Obat</Link>,
        },
        hasAnyPermission(session, ["units.view"]) && {
          key: "/master_data/units",
          icon: <PackageCheck {...iconProps} />,
          label: <Link href="/master_data/units">Satuan Obat</Link>,
        },
        hasAnyPermission(session, ["medicines.view"]) && {
          key: "/master_data/medicines",
          icon: <Pill {...iconProps} />,
          label: <Link href="/master_data/medicines">Obat</Link>,
        },
        hasAnyPermission(session, ["suppliers.view"]) && {
          key: "/master_data/suppliers",
          icon: <Truck {...iconProps} />,
          label: <Link href="/master_data/suppliers">Supplier</Link>,
        },
      ].filter(Boolean) as MenuProps["items"],
    },

    hasAnyPermission(session, ["purchases.view", "sales.view"]) && {
      key: "transactions",
      icon: <ShoppingCart {...iconProps} />,
      label: "Transaksi",
      children: [
        hasAnyPermission(session, ["purchases.view"]) && {
          key: "/transactions/purchases",
          icon: <ClipboardList {...iconProps} />,
          label: <Link href="/transactions/purchases">Pembelian Obat</Link>,
        },
        hasAnyPermission(session, ["sales.view"]) && {
          key: "/transactions/sales",
          icon: <Package {...iconProps} />,
          label: <Link href="/transactions/sales">Penjualan Obat</Link>,
        },
      ].filter(Boolean) as MenuProps["items"],
    },

    hasAnyPermission(session, ["stock.view", "stock.movement"]) && {
      key: "/stock",
      icon: <ChartNoAxesColumn {...iconProps} />,
      label: <Link href="/stock">Stock Obat</Link>,
    },

    hasAnyPermission(session, ["expired_medicines.view"]) && {
      key: "/expired-medicines",
      icon: <CircleAlert {...iconProps} />,
      label: <Link href="/expired-medicines">Kadaluarsa Obat</Link>,
    },

    hasAnyPermission(session, ["settings.view"]) && {
      key: "/settings",
      icon: <Settings {...iconProps} />,
      label: <Link href="/settings">Settings</Link>,
    },
  ].filter(Boolean) as MenuProps["items"];
}
