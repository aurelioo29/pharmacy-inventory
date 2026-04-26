"use client";

import { Form, Input, InputNumber } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormDropdownField from "@/components/ui/form/form-dropdown-field";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useUnits } from "@/features/units/hooks/user-units";

import {
  useCreateMedicine,
  useMedicine,
  useUpdateMedicine,
} from "../hooks/use-medicines";
import type {
  CreateMedicinePayload,
  UpdateMedicinePayload,
} from "../types/medicine";

type MedicineFormPageProps = {
  mode: "create" | "edit";
  medicineId?: string;
};

type MedicineFormValues = {
  categoryId: string;
  unitId: string;
  code: string;
  name: string;
  description?: string | null;
  minimumStock: number;
  isActive?: boolean;
};

export default function MedicineFormPage({
  mode,
  medicineId,
}: MedicineFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<MedicineFormValues>();

  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);
  const [unitLabel, setUnitLabel] = useState<string | null>(null);

  const medicineQuery = useMedicine(medicineId || "");
  const categoriesQuery = useCategories({
    page: 1,
    limit: 100,
    isActive: true,
  });
  const unitsQuery = useUnits({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();

  const medicine = medicineQuery.data?.data;
  const categories = categoriesQuery.data?.data.categories || [];
  const units = unitsQuery.data?.data.units || [];

  useEffect(() => {
    if (mode === "edit" && medicine) {
      form.setFieldsValue({
        categoryId: medicine.categoryId,
        unitId: medicine.unitId,
        code: medicine.code,
        name: medicine.name,
        description: medicine.description || "",
        minimumStock: medicine.minimumStock,
        isActive: medicine.isActive,
      });

      setCategoryLabel(medicine.category?.name || null);
      setUnitLabel(medicine.unit?.symbol || medicine.unit?.name || null);
    }

    if (mode === "create") {
      form.setFieldsValue({
        minimumStock: 0,
        isActive: true,
      });
    }
  }, [mode, medicine, form]);

  const categoryItems: MenuProps["items"] = useMemo(
    () =>
      categories.map((category) => ({
        key: category.id,
        label: category.name,
        onClick: () => {
          form.setFieldValue("categoryId", category.id);
          setCategoryLabel(category.name);
        },
      })),
    [categories, form],
  );

  const unitItems: MenuProps["items"] = useMemo(
    () =>
      units.map((unit) => ({
        key: unit.id,
        label: unit.symbol ? `${unit.name} (${unit.symbol})` : unit.name,
        onClick: () => {
          form.setFieldValue("unitId", unit.id);
          setUnitLabel(unit.symbol || unit.name);
        },
      })),
    [units, form],
  );

  function handleFinish(values: MedicineFormValues) {
    const basePayload = {
      categoryId: values.categoryId,
      unitId: values.unitId,
      code: values.code,
      name: values.name,
      description: values.description || null,
      minimumStock: Number(values.minimumStock || 0),
    };

    if (mode === "create") {
      createMedicine.mutate(basePayload as CreateMedicinePayload, {
        onSuccess: () => router.push("/master_data/medicines"),
      });

      return;
    }

    if (!medicineId) return;

    updateMedicine.mutate(
      {
        id: medicineId,
        payload: {
          ...basePayload,
          isActive: values.isActive,
        } as UpdateMedicinePayload,
      },
      {
        onSuccess: () => router.push("/master_data/medicines"),
      },
    );
  }

  const loading =
    createMedicine.isPending ||
    updateMedicine.isPending ||
    medicineQuery.isLoading ||
    categoriesQuery.isLoading ||
    unitsQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Medicines"
      onBack={() => router.push("/master_data/medicines")}
    >
      <FormCard>
        <Form<MedicineFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Code</RequiredLabel>}
              name="code"
              rules={[{ required: true, message: "Code wajib diisi" }]}
            >
              <Input className="his-form-input" placeholder="Contoh: OBT001" />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Name</RequiredLabel>}
              name="name"
              rules={[{ required: true, message: "Name wajib diisi" }]}
            >
              <Input
                className="his-form-input"
                placeholder="Contoh: Paracetamol"
              />
            </Form.Item>

            <FormDropdownField
              label={<RequiredLabel required>Category</RequiredLabel>}
              name="categoryId"
              value={categoryLabel}
              placeholder="Pilih kategori"
              items={categoryItems}
            />

            <FormDropdownField
              label={<RequiredLabel required>Unit</RequiredLabel>}
              name="unitId"
              value={unitLabel}
              placeholder="Pilih satuan"
              items={unitItems}
            />

            <Form.Item
              label={<RequiredLabel required>Minimum Stock</RequiredLabel>}
              name="minimumStock"
              rules={[{ required: true, message: "Minimum stock wajib diisi" }]}
            >
              <InputNumber
                className="his-form-input !w-full"
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              className="md:col-span-2"
            >
              <Input.TextArea
                rows={3}
                className="!rounded-none"
                placeholder="Deskripsi obat"
              />
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
