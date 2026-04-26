"use client";

import { LogoutOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    Modal.confirm({
      title: "Keluar?",
      content: "Apakah kamu yakin ingin logout?",
      okText: "Ya, Keluar",
      cancelText: "Batal",
      okButtonProps: {
        danger: true,
      },
      centered: true,
      onOk: () => signOut({ callbackUrl: "/login" }),
    });
  };

  return (
    <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
      Logout
    </Button>
  );
}
