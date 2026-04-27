"use client";

import { Form, Input, InputNumber, Modal } from "antd";
import type { MenuProps } from "antd";
import { useMemo } from "react";

import FormDropdownField from "@/components/ui/form/form-dropdown-field";
import RequiredLabel from "@/components/ui/required-label";
import { useCreateStockAdjustment } from "../hooks/use-stock-adjustments";
import type { AdjustmentType } from "../types/stock-adjustment";
import type { MedicineBatch } from "@/features/stock/types/stock";

type StockAdjustmentModalProps = {
  open: boolean;
  medicineId: string;
  batches: MedicineBatch[];
  onClose: () => void;
  onSuccess: () => void;
};

type StockAdjustmentFormValues = {
  medicineBatchId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason?: string | null;
};

const adjustmentOptions: AdjustmentType[] = [
  "EXPIRED",
  "DAMAGE",
  "LOSS",
  "CORRECTION",
  "OTHER",
];

export default function StockAdjustmentModal({
  open,
  medicineId,
  batches,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [form] = Form.useForm<StockAdjustmentFormValues>();
  const createAdjustment = useCreateStockAdjustment();

  const selectedBatchId = Form.useWatch("medicineBatchId", form);
  const selectedAdjustmentType = Form.useWatch("adjustmentType", form);

  const batchItems: MenuProps["items"] = useMemo(
    () =>
      batches
        .filter((batch) => batch.currentQuantity > 0)
        .map((batch) => ({
          key: batch.id,
          label: `${batch.batchNumber} - Stock: ${batch.currentQuantity}`,
          onClick: () => form.setFieldValue("medicineBatchId", batch.id),
        })),
    [batches, form],
  );

  const adjustmentItems: MenuProps["items"] = useMemo(
    () =>
      adjustmentOptions.map((item) => ({
        key: item,
        label: item,
        onClick: () => form.setFieldValue("adjustmentType", item),
      })),
    [form],
  );

  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId);

  function handleFinish(values: StockAdjustmentFormValues) {
    createAdjustment.mutate(
      {
        medicineId,
        medicineBatchId: values.medicineBatchId,
        adjustmentType: values.adjustmentType,
        quantity: Number(values.quantity),
        reason: values.reason || null,
      },
      {
        onSuccess,
      },
    );
  }

  return (
    <Modal
      title="Stock Adjustment"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createAdjustment.isPending}
      okText="Save Adjustment"
      cancelText="Batal"
      destroyOnHidden
    >
      <Form<StockAdjustmentFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
      >
        <FormDropdownField
          label={<RequiredLabel required>Batch</RequiredLabel>}
          name="medicineBatchId"
          value={selectedBatch?.batchNumber || null}
          placeholder="Pilih batch"
          items={batchItems}
        />

        <FormDropdownField
          label={<RequiredLabel required>Adjustment Type</RequiredLabel>}
          name="adjustmentType"
          value={selectedAdjustmentType || null}
          placeholder="Pilih tipe adjustment"
          items={adjustmentItems}
        />

        <Form.Item
          label={<RequiredLabel required>Quantity</RequiredLabel>}
          name="quantity"
          rules={[{ required: true, message: "Quantity wajib diisi" }]}
        >
          <InputNumber
            className="his-form-input !w-full"
            min={0}
            max={
              selectedAdjustmentType === "CORRECTION"
                ? undefined
                : selectedBatch?.currentQuantity
            }
            placeholder={
              selectedAdjustmentType === "CORRECTION"
                ? "Masukkan stock baru"
                : "Masukkan quantity"
            }
          />
        </Form.Item>

        <Form.Item label="Reason" name="reason">
          <Input.TextArea
            rows={3}
            className="!rounded-none"
            placeholder="Alasan adjustment"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
