import { Input } from "antd";

type FilterInputProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
};

export default function FilterInput({
  value,
  placeholder,
  onChange,
  onEnter,
}: FilterInputProps) {
  return (
    <Input
      allowClear
      className="his-filter-input"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onPressEnter={onEnter}
    />
  );
}
