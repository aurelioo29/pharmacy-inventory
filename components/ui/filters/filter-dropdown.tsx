import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";

type FilterDropdownProps = {
  label: string;
  items: MenuProps["items"];
  muted?: boolean;
};

export default function FilterDropdown({
  label,
  items,
  muted = false,
}: FilterDropdownProps) {
  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      className="his-filter-dropdown"
    >
      <button type="button" className="his-dropdown-select">
        <span className={muted ? "text-slate-400" : "text-slate-700"}>
          {label}
        </span>

        <DownOutlined className="text-[10px] text-slate-400" />
      </button>
    </Dropdown>
  );
}
