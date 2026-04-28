"use client";

import { Button, Card, Form, Input, InputNumber, Skeleton } from "antd";
import { Save } from "lucide-react";
import { useEffect } from "react";

import RequiredLabel from "@/components/ui/required-label";
import { useSettings, useUpdateSettings } from "../hooks/use-settings";
import type { Setting, UpdateSettingsPayload } from "../types/setting";

type SettingsFormValues = {
  storeName: string;
  currency: string;
  expiredWarningDays: number;
  invoicePrefixPurchase: string;
  invoicePrefixSale: string;
  receiptFooter: string;
};

function getSettingValue(settings: Setting[], key: string, fallback = "") {
  return settings.find((setting) => setting.key === key)?.value || fallback;
}

export default function SettingsPageClient() {
  const [form] = Form.useForm<SettingsFormValues>();

  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();

  const settings = settingsQuery.data?.data.settings || [];

  useEffect(() => {
    if (!settings.length) return;

    form.setFieldsValue({
      storeName: getSettingValue(settings, "store_name", "Pharmacy Inventory"),
      currency: getSettingValue(settings, "currency", "IDR"),
      expiredWarningDays: Number(
        getSettingValue(settings, "expired_warning_days", "30"),
      ),
      invoicePrefixPurchase: getSettingValue(
        settings,
        "invoice_prefix_purchase",
        "PUR",
      ),
      invoicePrefixSale: getSettingValue(
        settings,
        "invoice_prefix_sale",
        "SAL",
      ),
      receiptFooter: getSettingValue(
        settings,
        "receipt_footer",
        "Terima kasih",
      ),
    });
  }, [settings, form]);

  function handleFinish(values: SettingsFormValues) {
    const payload: UpdateSettingsPayload = {
      settings: [
        {
          key: "store_name",
          value: values.storeName,
          type: "string",
          description: "Nama toko/apotek",
        },
        {
          key: "currency",
          value: values.currency,
          type: "string",
          description: "Mata uang sistem",
        },
        {
          key: "expired_warning_days",
          value: String(values.expiredWarningDays),
          type: "number",
          description: "Jumlah hari peringatan obat hampir kadaluarsa",
        },
        {
          key: "invoice_prefix_purchase",
          value: values.invoicePrefixPurchase,
          type: "string",
          description: "Prefix invoice pembelian",
        },
        {
          key: "invoice_prefix_sale",
          value: values.invoicePrefixSale,
          type: "string",
          description: "Prefix invoice penjualan",
        },
        {
          key: "receipt_footer",
          value: values.receiptFooter,
          type: "string",
          description: "Footer struk/invoice",
        },
      ],
    };

    updateSettings.mutate(payload);
  }

  if (settingsQuery.isLoading) {
    return <Skeleton active />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        <div className="text-sm font-bold text-slate-800">General Settings</div>
        <div className="mt-1 text-xs text-slate-500">
          Konfigurasi sistem, invoice, expired warning, dan informasi struk.
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        <Form<SettingsFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Store Name</RequiredLabel>}
              name="storeName"
              rules={[{ required: true, message: "Store name wajib diisi" }]}
            >
              <Input
                className="his-form-input"
                placeholder="Pharmacy Inventory"
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Currency</RequiredLabel>}
              name="currency"
              rules={[{ required: true, message: "Currency wajib diisi" }]}
            >
              <Input className="his-form-input" placeholder="IDR" />
            </Form.Item>

            <Form.Item
              label={
                <RequiredLabel required>Expired Warning Days</RequiredLabel>
              }
              name="expiredWarningDays"
              rules={[
                {
                  required: true,
                  message: "Expired warning days wajib diisi",
                },
              ]}
            >
              <InputNumber
                className="his-form-input"
                min={1}
                controls={false}
                placeholder="30"
              />
            </Form.Item>

            <Form.Item
              label={
                <RequiredLabel required>Purchase Invoice Prefix</RequiredLabel>
              }
              name="invoicePrefixPurchase"
              rules={[
                {
                  required: true,
                  message: "Purchase invoice prefix wajib diisi",
                },
              ]}
            >
              <Input className="his-form-input" placeholder="PUR" />
            </Form.Item>

            <Form.Item
              label={
                <RequiredLabel required>Sale Invoice Prefix</RequiredLabel>
              }
              name="invoicePrefixSale"
              rules={[
                {
                  required: true,
                  message: "Sale invoice prefix wajib diisi",
                },
              ]}
            >
              <Input className="his-form-input" placeholder="SAL" />
            </Form.Item>

            <Form.Item label="Receipt Footer" name="receiptFooter">
              <Input className="his-form-input" placeholder="Terima kasih" />
            </Form.Item>
          </div>

          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <Button
              type="primary"
              className="his-toolbar-button !border-none"
              icon={<Save size={15} />}
              loading={updateSettings.isPending}
              onClick={() => form.submit()}
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
