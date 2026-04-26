"use client";

import { Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";

import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../hooks/use-categories";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";

type CategoryFormPageProps = {
  mode: "create" | "edit";
  categoryId?: string;
};

type CategoryFormValues = {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryFormPage({
  mode,
  categoryId,
}: CategoryFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<CategoryFormValues>();

  const categoryQuery = useCategory(categoryId || "");
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const category = categoryQuery.data?.data;

  useEffect(() => {
    if (mode === "edit" && category) {
      form.setFieldsValue({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        isActive: category.isActive,
      });
    }

    if (mode === "create") {
      form.setFieldsValue({
        isActive: true,
      });
    }
  }, [mode, category, form]);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;

    if (mode === "create") {
      form.setFieldValue("slug", generateSlug(name));
    }
  }

  function handleFinish(values: CategoryFormValues) {
    const basePayload = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
    };

    if (mode === "create") {
      createCategory.mutate(basePayload as CreateCategoryPayload, {
        onSuccess: () => router.push("/master_data/categories"),
      });

      return;
    }

    if (!categoryId) return;

    updateCategory.mutate(
      {
        id: categoryId,
        payload: {
          ...basePayload,
          isActive: values.isActive,
        } as UpdateCategoryPayload,
      },
      {
        onSuccess: () => router.push("/master_data/categories"),
      },
    );
  }

  const loading =
    createCategory.isPending ||
    updateCategory.isPending ||
    categoryQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Categories"
      onBack={() => router.push("/master_data/categories")}
    >
      <FormCard>
        <Form<CategoryFormValues>
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
                placeholder="Contoh: Antibiotik"
                onChange={handleNameChange}
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Slug</RequiredLabel>}
              name="slug"
              rules={[{ required: true, message: "Slug wajib diisi" }]}
            >
              <Input
                className="his-form-input"
                placeholder="Contoh: antibiotik"
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
                placeholder="Deskripsi kategori"
              />
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
