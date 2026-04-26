import { Form } from "antd";
import type { MenuProps } from "antd";
import type { NamePath } from "antd/es/form/interface";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";

type FormDropdownFieldProps = {
  label: React.ReactNode;
  name: NamePath;
  value?: string | null;
  placeholder: string;
  items: MenuProps["items"];
  rules?: object[];
};

export default function FormDropdownField({
  label,
  name,
  value,
  placeholder,
  items,
  rules,
}: FormDropdownFieldProps) {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <FilterDropdown
        label={value || placeholder}
        muted={!value}
        items={items}
      />
    </Form.Item>
  );
}
