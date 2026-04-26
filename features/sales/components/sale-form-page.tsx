"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";
import { useMedicines } from "@/features/medicines/hooks/use-medicines";
import StockInfoPanel from "@/components/ui/stock-info-panel";

import { useCreateSale } from "../hooks/use-sales";
import type { CreateSalePayload } from "../types/sale";

type SaleItemForm = {
  medicineId?: string;
  quantity?: number;
};

type SaleFormValues = {
  saleDate: Dayjs;
  paidAmount: number;
  notes?: string | null;
  items: SaleItemForm[];
};

function money(value?: number | string | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function SaleFormPage() {
  const router = useRouter();
  const [form] = Form.useForm<SaleFormValues>();

  const createSale = useCreateSale();

  const medicinesQuery = useMedicines({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const medicines = medicinesQuery.data?.data.medicines || [];

  const watchedItems = Form.useWatch("items", form);
  const paidAmount = Form.useWatch("paidAmount", form);

  const items: SaleItemForm[] = Array.isArray(watchedItems) ? watchedItems : [];

  const medicineOptions = useMemo(
    () =>
      medicines.map((medicine) => ({
        value: medicine.id,
        label: `${medicine.code} - ${medicine.name}`,
      })),
    [medicines],
  );

  const estimatedTotal = items.reduce((total, item) => {
    const medicine = medicines.find((med) => med.id === item.medicineId);
    const quantity = Number(item.quantity || 0);

    /**
     * Ini estimasi UI saja.
     * Harga final tetap dari backend berdasarkan batch FIFO.
     */
    const estimatedSellingPrice = Number((medicine as any)?.sellingPrice || 0);

    return total + quantity * estimatedSellingPrice;
  }, 0);

  const changeAmount = Number(paidAmount || 0) - estimatedTotal;

  function handleFinish(values: SaleFormValues) {
    const payload: CreateSalePayload = {
      saleDate: values.saleDate.format("YYYY-MM-DD"),
      paidAmount: Number(values.paidAmount || 0),
      notes: values.notes || null,
      items: values.items.map((item) => ({
        medicineId: item.medicineId || "",
        quantity: Number(item.quantity || 0),
      })),
    };

    createSale.mutate(payload, {
      onSuccess: (response) => {
        router.push(`/transactions/sales/${response.data.id}`);
      },
    });
  }

  const loading = createSale.isPending || medicinesQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Sales"
      onBack={() => router.push("/transactions/sales")}
    >
      <FormCard>
        <Form<SaleFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          preserve
          initialValues={{
            saleDate: dayjs(),
            paidAmount: 0,
            items: [{}],
          }}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Sale Date</RequiredLabel>}
              name="saleDate"
              rules={[{ required: true, message: "Tanggal wajib diisi" }]}
            >
              <DatePicker
                className="his-form-input"
                format="DD-MM-YYYY"
                placeholder="Pilih tanggal"
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Paid Amount</RequiredLabel>}
              name="paidAmount"
              rules={[{ required: true, message: "Jumlah bayar wajib diisi" }]}
            >
              <InputNumber
                className="his-form-input"
                min={0}
                controls={false}
                placeholder="Jumlah bayar"
                formatter={(value) =>
                  value ? `Rp ${Number(value).toLocaleString("id-ID")}` : ""
                }
                parser={(value) =>
                  value?.replace(/Rp\s?|(,*)/g, "").replace(/\./g, "") || ""
                }
              />
            </Form.Item>

            <Form.Item label="Notes" name="notes" className="md:col-span-2">
              <Input
                className="his-form-input"
                placeholder="Catatan optional"
              />
            </Form.Item>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="mt-6 border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      Sale Items
                    </div>
                    <div className="text-xs text-slate-500">
                      Pilih obat dan quantity. Batch akan dipotong otomatis
                      dengan FIFO.
                    </div>
                  </div>

                  <Button
                    type="primary"
                    className="his-toolbar-button"
                    icon={<Plus size={15} />}
                    onClick={() => add({})}
                  >
                    Add Item
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[1fr_160px_60px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700">
                      <div>Medicine</div>
                      <div className="text-right">Qty</div>
                      <div />
                    </div>

                    {fields.map((field) => (
                      <div
                        key={field.key}
                        className="grid grid-cols-[1fr_160px_60px] items-start gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
                      >
                        <Form.Item
                          preserve
                          name={[field.name, "medicineId"]}
                          rules={[
                            {
                              required: true,
                              message: "Obat wajib dipilih",
                            },
                          ]}
                          className="!mb-0"
                        >
                          <Select
                            showSearch
                            className="his-form-select"
                            placeholder="Pilih obat"
                            optionFilterProp="label"
                            options={medicineOptions}
                            getPopupContainer={(triggerNode) =>
                              triggerNode.parentElement || document.body
                            }
                          />
                        </Form.Item>

                        <Form.Item
                          preserve
                          name={[field.name, "quantity"]}
                          rules={[
                            {
                              required: true,
                              message: "Qty wajib diisi",
                            },
                          ]}
                          className="!mb-0"
                        >
                          <InputNumber
                            className="his-form-input"
                            min={1}
                            controls={false}
                            placeholder="Qty"
                          />
                        </Form.Item>

                        <div className="flex h-10 items-center justify-center">
                          <Button
                            danger
                            type="text"
                            className="!h-10 !w-10 !rounded-none !border-none"
                            icon={<Trash2 size={15} />}
                            onClick={() => remove(field.name)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Form.List>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StockInfoPanel items={items} medicines={medicines} />

            <div className="w-full border border-slate-200 bg-white">
              <div className="grid grid-cols-[180px_1fr] border-b border-slate-100">
                <div className="bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Estimated Total
                </div>
                <div className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                  Rp {money(estimatedTotal)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] border-b border-slate-100">
                <div className="bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Paid Amount
                </div>
                <div className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                  Rp {money(paidAmount)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr]">
                <div className="bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Estimated Change
                </div>
                <div
                  className={
                    changeAmount < 0
                      ? "px-4 py-3 text-right text-sm font-bold text-red-600"
                      : "px-4 py-3 text-right text-sm font-bold text-green-600"
                  }
                >
                  Rp {money(changeAmount)}
                </div>
              </div>
            </div>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
