import { Form } from "antd";
import type { MenuProps } from "antd";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";

type FormDropdownFieldProps = {
  label: React.ReactNode;
  name: string;
  value?: string | null;
  placeholder: string;
  items: MenuProps["items"];
};

export default function FormDropdownField({
  label,
  name,
  value,
  placeholder,
  items,
}: FormDropdownFieldProps) {
  return (
    <Form.Item label={label} name={name}>
      <FilterDropdown
        label={value || placeholder}
        muted={!value}
        items={items}
      />
    </Form.Item>
  );
}
