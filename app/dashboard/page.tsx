import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, Col, Row, Statistic } from "antd";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout session={session} title="Home">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Obat" value={0} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Stok Rendah" value={0} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Obat Hampir Expired" value={0} />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}
