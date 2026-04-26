import { Card } from "antd";

type FormCardProps = {
  children: React.ReactNode;
};

export default function FormCard({ children }: FormCardProps) {
  return (
    <Card
      className="!rounded-none !border !border-slate-200 !bg-white"
      styles={{ body: { padding: 16 } }}
    >
      {children}
    </Card>
  );
}
