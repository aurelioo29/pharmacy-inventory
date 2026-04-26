"use client";

import { Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";

import {
  useCreateSupplier,
  useSupplier,
  useUpdateSupplier,
} from "../hooks/use-suppliers";
import type {
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "../types/supplier";

type SupplierFormPageProps = {
  mode: "create" | "edit";
  supplierId?: string;
};

type SupplierFormValues = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive?: boolean;
};

export default function SupplierFormPage({
  mode,
  supplierId,
}: SupplierFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<SupplierFormValues>();

  const supplierQuery = useSupplier(supplierId || "");
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const supplier = supplierQuery.data?.data;

  useEffect(() => {
    if (mode === "edit" && supplier) {
      form.setFieldsValue({
        name: supplier.name,
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        isActive: supplier.isActive,
      });
    }

    if (mode === "create") {
      form.setFieldsValue({
        isActive: true,
      });
    }
  }, [mode, supplier, form]);

  function handleFinish(values: SupplierFormValues) {
    const basePayload = {
      name: values.name,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
    };

    if (mode === "create") {
      createSupplier.mutate(basePayload as CreateSupplierPayload, {
        onSuccess: () => router.push("/master_data/suppliers"),
      });

      return;
    }

    if (!supplierId) return;

    updateSupplier.mutate(
      {
        id: supplierId,
        payload: {
          ...basePayload,
          isActive: values.isActive,
        } as UpdateSupplierPayload,
      },
      {
        onSuccess: () => router.push("/master_data/suppliers"),
      },
    );
  }

  const loading =
    createSupplier.isPending ||
    updateSupplier.isPending ||
    supplierQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Suppliers"
      onBack={() => router.push("/master_data/suppliers")}
    >
      <FormCard>
        <Form<SupplierFormValues>
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
              <Input
                className="his-form-input"
                placeholder="Contoh: PT Kimia Farma"
              />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
              <Input
                className="his-form-input"
                placeholder="Contoh: 08123456789"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Format email tidak valid" }]}
            >
              <Input
                className="his-form-input"
                placeholder="supplier@email.com"
              />
            </Form.Item>

            <Form.Item label="Address" name="address">
              <Input.TextArea
                rows={3}
                className="!rounded-none"
                placeholder="Alamat supplier"
              />
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
