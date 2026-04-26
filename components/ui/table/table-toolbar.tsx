"use client";

import { Button, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { Plus, RefreshCcw, Settings2 } from "lucide-react";

type TableColumnOption = {
  key: string;
  label: string;
};

type TableToolbarProps = {
  selectedCount?: number;
  bulkItems?: MenuProps["items"];
  columnItems?: TableColumnOption[];
  visibleColumnKeys?: string[];
  onToggleColumn?: (key: string) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  addText?: string;
};

export default function TableToolbar({
  selectedCount = 0,
  bulkItems = [],
  columnItems = [],
  visibleColumnKeys = [],
  onToggleColumn,
  onAdd,
  onRefresh,
  addText = "Add New",
}: TableToolbarProps) {
  const columnMenuItems: MenuProps["items"] = columnItems.map((column) => ({
    key: column.key,
    label: (
      <span>
        <input
          type="checkbox"
          checked={visibleColumnKeys.includes(column.key)}
          readOnly
          className="mr-2"
        />
        {column.label}
      </span>
    ),
    onClick: () => onToggleColumn?.(column.key),
  }));

  return (
    <Space>
      <Dropdown
        disabled={selectedCount === 0}
        menu={{ items: bulkItems }}
        trigger={["click"]}
      >
        <Button className="his-toolbar-button" disabled={selectedCount === 0}>
          {selectedCount > 0 ? `Bulk action (${selectedCount})` : "Bulk action"}
        </Button>
      </Dropdown>

      <Button
        type="primary"
        className="his-toolbar-button"
        icon={<Plus size={15} />}
        onClick={onAdd}
      >
        {addText}
      </Button>

      <Button
        className="his-toolbar-icon-button"
        icon={<RefreshCcw size={16} />}
        onClick={onRefresh}
      />

      <Dropdown
        menu={{ items: columnMenuItems }}
        trigger={["click"]}
        className="his-column-dropdown"
      >
        <Button
          className="his-toolbar-icon-button"
          icon={<Settings2 size={16} />}
        />
      </Dropdown>
    </Space>
  );
}
