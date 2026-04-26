"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/use-categories";
import CategoryInfoTable from "./category-info-table";

type CategoryDetailPageProps = {
  categoryId: string;
};

export default function CategoryDetailPage({
  categoryId,
}: CategoryDetailPageProps) {
  const router = useRouter();

  const categoryQuery = useCategory(categoryId);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const category = categoryQuery.data?.data;

  function handleDelete() {
    deleteCategory.mutate(categoryId, {
      onSuccess: () => router.push("/master_data/categories"),
    });
  }

  function handleToggleStatus(checked: boolean) {
    updateCategory.mutate(
      {
        id: categoryId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => categoryQuery.refetch(),
      },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 12 } }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="text"
            className="!rounded-none !border-none !px-0"
            icon={<ArrowLeft size={15} />}
            onClick={() => router.push("/master_data/categories")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() =>
              router.push(`/master_data/categories/${categoryId}/edit`)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Deactivate category?"
            description="Kategori akan dinonaktifkan."
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleDelete}
          >
            <Button
              type="text"
              danger
              className="!rounded-none !border-none"
              icon={<Trash2 size={15} />}
              loading={deleteCategory.isPending}
            >
              Delete
            </Button>
          </Popconfirm>

          {category && (
            <Switch
              checked={category.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateCategory.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {categoryQuery.isLoading || !category ? (
          <Skeleton active />
        ) : (
          <CategoryInfoTable category={category} />
        )}
      </Card>
    </div>
  );
}
