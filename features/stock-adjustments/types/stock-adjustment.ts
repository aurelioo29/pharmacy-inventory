export type AdjustmentType =
  | "EXPIRED"
  | "DAMAGE"
  | "LOSS"
  | "CORRECTION"
  | "OTHER";

export type CreateStockAdjustmentPayload = {
  medicineId: string;
  medicineBatchId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason?: string | null;
};
