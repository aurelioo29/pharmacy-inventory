import { Button, Card } from "antd";
import { ArrowLeft } from "lucide-react";

type FormPageShellProps = {
  children: React.ReactNode;
  backText: string;
  onBack: () => void;
};

export default function FormPageShell({
  children,
  backText,
  onBack,
}: FormPageShellProps) {
  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        <Button
          type="text"
          className="!rounded-none !border-none !px-0"
          icon={<ArrowLeft size={15} />}
          onClick={onBack}
        >
          {backText}
        </Button>
      </Card>

      {children}
    </div>
  );
}
