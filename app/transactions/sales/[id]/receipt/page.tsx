import { auth } from "@/auth";
import SaleReceiptPage from "@/features/sales/components/sale-receipt-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type SaleReceiptRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SaleReceiptRoute({
  params,
}: SaleReceiptRouteProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "sales.view")) redirect("/dashboard");

  const { id } = await params;

  return <SaleReceiptPage saleId={id} />;
}
