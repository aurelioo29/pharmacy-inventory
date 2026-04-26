import { Button } from "antd";
import { Save } from "lucide-react";

type FormActionsProps = {
  loading?: boolean;
  saveText?: string;
  onSave: () => void;
};

export default function FormActions({
  loading,
  saveText = "Save",
  onSave,
}: FormActionsProps) {
  return (
    <div className="mt-6 flex justify-end">
      <Button
        type="primary"
        className="his-toolbar-button !border-none"
        icon={<Save size={15} />}
        loading={loading}
        onClick={onSave}
      >
        {saveText}
      </Button>
    </div>
  );
}
