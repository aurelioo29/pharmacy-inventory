"use client";

import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

type ResetPasswordModalProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
};

type ResetPasswordFormValues = {
  pin: string;
};

export default function ResetPasswordModal({
  open,
  loading,
  onClose,
  onSubmit,
}: ResetPasswordModalProps) {
  const [form] = Form.useForm<ResetPasswordFormValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Reset Password"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Reset Password"
      cancelText="Batal"
      destroyOnHidden
    >
      <div className="mb-4 text-sm text-slate-600">
        Password user akan direset menjadi{" "}
        <span className="font-bold text-slate-900">password</span>. Masukkan PIN
        confirmation untuk lanjut.
      </div>

      <Form<ResetPasswordFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={(values) => onSubmit(values.pin)}
      >
        <Form.Item
          label="PIN Confirmation"
          name="pin"
          rules={[{ required: true, message: "PIN wajib diisi" }]}
        >
          <Input.Password
            className="his-form-input"
            placeholder="Masukkan PIN confirmation"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
