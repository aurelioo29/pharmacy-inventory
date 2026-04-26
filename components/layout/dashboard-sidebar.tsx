import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import type { MenuProps } from "antd";

type DashboardSidebarProps = {
  collapsed: boolean;
  selectedKey: string;
  menuItems: MenuProps["items"];
  onToggle: () => void;
};

export default function DashboardSidebar({
  collapsed,
  selectedKey,
  menuItems,
  onToggle,
}: DashboardSidebarProps) {
  return (
    <Layout.Sider
      width={260}
      collapsedWidth={56}
      collapsed={collapsed}
      trigger={null}
      className="!bg-white"
    >
      <div className="flex h-[calc(100vh-64px)] flex-col">
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={
              collapsed ? [] : ["master-data", "transactions", "system"]
            }
            inlineCollapsed={collapsed}
            className="!border-r-0"
            items={menuItems}
          />
        </div>

        <div className="border-t border-slate-200 p-3">
          <Button
            block
            type="primary"
            size="small"
            onClick={onToggle}
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          >
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </div>
    </Layout.Sider>
  );
}
