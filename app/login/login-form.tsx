"use client";

import { useState } from "react";
import { Button, Form, Input, Typography, Alert } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Text } = Typography;

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFinish(values: LoginFormValues) {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage("Username atau password salah.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: "url('/auth/bg-auth.png')",
      }}
    >
      <div className="w-full max-w-[430px]">
        <div className="mb-6 text-center">
          <Title level={2} className="!mb-2 !text-slate-800">
            Login
          </Title>
          <Text className="!text-slate-600">
            Masukkan username dan password Anda
          </Text>
        </div>

        {errorMessage && (
          <Alert
            className="!mb-4"
            type="error"
            showIcon
            message={errorMessage}
          />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Username wajib diisi" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Username"
              className="!rounded-none"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Password"
              className="!rounded-none"
            />
          </Form.Item>

          <Button
            block
            size="large"
            type="primary"
            htmlType="submit"
            loading={loading}
            className="!rounded-none"
          >
            Masuk
          </Button>
        </Form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Username: admin • Password: password123
        </div>
      </div>
    </main>
  );
}
