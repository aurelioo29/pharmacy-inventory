"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { MenuProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormDropdownField from "@/components/ui/form/form-dropdown-field";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";
import { useMedicines } from "@/features/medicines/hooks/use-medicines";
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers";

import {
  useCreatePurchase,
  usePurchase,
  useUpdatePurchase,
} from "../hooks/use-purchases";
import type { CreatePurchasePayload } from "../types/purchase";

type PurchaseFormPageProps = {
  mode: "create" | "edit";
  purchaseId?: string;
};

type PurchaseItemForm = {
  medicineId?: string;
  batchNumber?: string;
  expiredDate?: Dayjs | null;
  quantity?: number;
  purchasePrice?: number;
  sellingPrice?: number;
};

type PurchaseFormValues = {
  supplierId: string;
  purchaseDate: Dayjs;
  notes?: string | null;
  items: PurchaseItemForm[];
};

function money(value?: number | string | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function PurchaseFormPage({
  mode,
  purchaseId,
}: PurchaseFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<PurchaseFormValues>();
  const initializedRef = useRef(false);

  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const purchaseQuery = usePurchase(purchaseId || "");

  const suppliersQuery = useSuppliers({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const medicinesQuery = useMedicines({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const purchase = purchaseQuery.data?.data;
  const suppliers = suppliersQuery.data?.data.suppliers || [];
  const medicines = medicinesQuery.data?.data.medicines || [];

  const supplierId = Form.useWatch("supplierId", form);
  const watchedItems = Form.useWatch("items", form);

  const items: PurchaseItemForm[] = Array.isArray(watchedItems)
    ? watchedItems
    : [];

  const selectedSupplier = suppliers.find((item) => item.id === supplierId);

  useEffect(() => {
    if (initializedRef.current) return;

    if (mode === "create") {
      form.setFieldsValue({
        purchaseDate: dayjs(),
        items: [{}],
      });

      initializedRef.current = true;
      return;
    }

    if (mode === "edit" && purchase) {
      form.setFieldsValue({
        supplierId: purchase.supplierId,
        purchaseDate: dayjs(purchase.purchaseDate),
        notes: purchase.notes || "",
        items:
          purchase.items?.map((item) => ({
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            expiredDate: dayjs(item.expiredDate),
            quantity: item.quantity,
            purchasePrice: Number(item.purchasePrice),
            sellingPrice: Number(item.sellingPrice),
          })) || [],
      });

      initializedRef.current = true;
    }
  }, [mode, purchase, form]);

  const supplierItems: MenuProps["items"] = useMemo(
    () =>
      suppliers.map((supplier) => ({
        key: supplier.id,
        label: supplier.name,
        onClick: () => form.setFieldValue("supplierId", supplier.id),
      })),
    [suppliers, form],
  );

  const medicineOptions = useMemo(
    () =>
      medicines.map((medicine) => ({
        value: medicine.id,
        label: `${medicine.code} - ${medicine.name}`,
      })),
    [medicines],
  );

  const totalAmount = items.reduce((total, item) => {
    return (
      total + Number(item?.quantity || 0) * Number(item?.purchasePrice || 0)
    );
  }, 0);

  function handleFinish(values: PurchaseFormValues) {
    if (mode === "edit") {
      if (!purchaseId) return;

      updatePurchase.mutate(
        {
          id: purchaseId,
          payload: {
            purchaseDate: values.purchaseDate.format("YYYY-MM-DD"),
            notes: values.notes || null,
          },
        },
        {
          onSuccess: () => router.push(`/transactions/purchases/${purchaseId}`),
        },
      );

      return;
    }

    const payload: CreatePurchasePayload = {
      supplierId: values.supplierId,
      purchaseDate: values.purchaseDate.format("YYYY-MM-DD"),
      notes: values.notes || null,
      items: values.items.map((item) => ({
        medicineId: item.medicineId || "",
        batchNumber: item.batchNumber || "",
        expiredDate: item.expiredDate
          ? item.expiredDate.format("YYYY-MM-DD")
          : "",
        quantity: Number(item.quantity || 0),
        purchasePrice: Number(item.purchasePrice || 0),
        sellingPrice: Number(item.sellingPrice || 0),
      })),
    };

    createPurchase.mutate(payload, {
      onSuccess: (response) => {
        router.push(`/transactions/purchases/${response.data.id}`);
      },
    });
  }

  const loading =
    createPurchase.isPending ||
    updatePurchase.isPending ||
    suppliersQuery.isLoading ||
    medicinesQuery.isLoading ||
    purchaseQuery.isLoading;

  const isEdit = mode === "edit";

  return (
    <FormPageShell
      backText="Back to Purchases"
      onBack={() => router.push("/transactions/purchases")}
    >
      <FormCard>
        <Form<PurchaseFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          preserve
          initialValues={{
            purchaseDate: dayjs(),
            items: [{}],
          }}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <FormDropdownField
              label={<RequiredLabel required>Supplier</RequiredLabel>}
              name="supplierId"
              value={selectedSupplier?.name || purchase?.supplier?.name || null}
              placeholder="Pilih supplier"
              items={supplierItems}
              rules={[{ required: true, message: "Supplier wajib dipilih" }]}
            />

            <Form.Item
              label={<RequiredLabel required>Purchase Date</RequiredLabel>}
              name="purchaseDate"
              rules={[{ required: true, message: "Tanggal wajib diisi" }]}
            >
              <DatePicker
                className="his-form-input"
                format="DD-MM-YYYY"
                placeholder="Pilih tanggal"
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
                      Purchase Items
                    </div>
                  </div>

                  {!isEdit && (
                    <Button
                      type="primary"
                      className="his-toolbar-button"
                      icon={<Plus size={15} />}
                      onClick={() => add({})}
                    >
                      Add Item
                    </Button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[1280px]">
                    <div className="grid grid-cols-[260px_160px_170px_110px_160px_160px_150px_48px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700">
                      <div>Medicine</div>
                      <div>Batch Number</div>
                      <div>Expired Date</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Purchase Price</div>
                      <div className="text-right">Selling Price</div>
                      <div className="text-right">Subtotal</div>
                      <div />
                    </div>

                    {fields.map((field) => {
                      const item = items?.[field.name];
                      const subtotal =
                        Number(item?.quantity || 0) *
                        Number(item?.purchasePrice || 0);

                      return (
                        <div
                          key={field.key}
                          className="grid grid-cols-[260px_160px_170px_110px_160px_160px_150px_48px] items-start gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
                        >
                          <Form.Item
                            preserve
                            name={[field.name, "medicineId"]}
                            rules={[
                              { required: true, message: "Obat wajib dipilih" },
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
                            name={[field.name, "batchNumber"]}
                            rules={[
                              { required: true, message: "Batch wajib diisi" },
                            ]}
                            className="!mb-0"
                          >
                            <Input
                              className="his-form-input"
                              placeholder="Batch"
                            />
                          </Form.Item>

                          <Form.Item
                            preserve
                            name={[field.name, "expiredDate"]}
                            rules={[
                              {
                                required: true,
                                message: "Expired wajib diisi",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <DatePicker
                              className="his-form-input"
                              format="DD-MM-YYYY"
                              placeholder="Tanggal"
                            />
                          </Form.Item>

                          <Form.Item
                            preserve
                            name={[field.name, "quantity"]}
                            rules={[
                              { required: true, message: "Qty wajib diisi" },
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

                          <Form.Item
                            preserve
                            name={[field.name, "purchasePrice"]}
                            rules={[
                              {
                                required: true,
                                message: "Harga beli wajib diisi",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <InputNumber
                              className="his-form-input"
                              min={0}
                              controls={false}
                              placeholder="Harga beli"
                            />
                          </Form.Item>

                          <Form.Item
                            preserve
                            name={[field.name, "sellingPrice"]}
                            rules={[
                              {
                                required: true,
                                message: "Harga jual wajib diisi",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <InputNumber
                              className="his-form-input"
                              min={0}
                              controls={false}
                              placeholder="Harga jual"
                            />
                          </Form.Item>

                          <div className="flex h-10 items-center justify-end text-sm font-bold text-slate-900">
                            Rp {money(subtotal)}
                          </div>

                          <div className="flex h-10 items-center justify-center">
                            <Button
                              danger
                              type="text"
                              disabled={isEdit}
                              className="!h-10 !w-10 !rounded-none !border-none"
                              icon={<Trash2 size={15} />}
                              onClick={() => remove(field.name)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Form.List>

          <div className="mt-4 flex justify-end">
            <div className="w-full border border-slate-200 md:w-[360px]">
              <div className="grid grid-cols-[160px_1fr] border-b border-slate-100">
                <div className="bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Total Amount
                </div>
                <div className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                  Rp {money(totalAmount)}
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
