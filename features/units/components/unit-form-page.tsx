"use client";

import { Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";

import { useCreateUnit, useUnit, useUpdateUnit } from "../hooks/user-units";
import type { CreateUnitPayload, UpdateUnitPayload } from "../types/unit";

type UnitFormPageProps = {
  mode: "create" | "edit";
  unitId?: string;
};

type UnitFormValues = {
  name: string;
  symbol?: string | null;
  isActive?: boolean;
};

export default function UnitFormPage({ mode, unitId }: UnitFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<UnitFormValues>();

  const unitQuery = useUnit(unitId || "");
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const unit = unitQuery.data?.data;

  useEffect(() => {
    if (mode === "edit" && unit) {
      form.setFieldsValue({
        name: unit.name,
        symbol: unit.symbol || "",
        isActive: unit.isActive,
      });
    }

    if (mode === "create") {
      form.setFieldsValue({
        isActive: true,
      });
    }
  }, [mode, unit, form]);

  function handleFinish(values: UnitFormValues) {
    const basePayload = {
      name: values.name,
      symbol: values.symbol || null,
    };

    if (mode === "create") {
      createUnit.mutate(basePayload as CreateUnitPayload, {
        onSuccess: () => router.push("/master_data/units"),
      });

      return;
    }

    if (!unitId) return;

    updateUnit.mutate(
      {
        id: unitId,
        payload: {
          ...basePayload,
          isActive: values.isActive,
        } as UpdateUnitPayload,
      },
      {
        onSuccess: () => router.push("/master_data/units"),
      },
    );
  }

  const loading =
    createUnit.isPending || updateUnit.isPending || unitQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Units"
      onBack={() => router.push("/master_data/units")}
    >
      <FormCard>
        <Form<UnitFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Name</RequiredLabel>}
              name="name"
              rules={[{ required: true, message: "Name wajib diisi" }]}
            >
              <Input className="his-form-input" placeholder="Contoh: Strip" />
            </Form.Item>

            <Form.Item label="Symbol" name="symbol">
              <Input className="his-form-input" placeholder="Contoh: strip" />
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
