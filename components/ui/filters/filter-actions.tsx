import { Button } from "antd";
import { Search } from "lucide-react";

type FilterActionsProps = {
  onSearch: () => void;
  onReset: () => void;
  span?: string;
};

export default function FilterActions({
  onSearch,
  onReset,
  span = "",
}: FilterActionsProps) {
  return (
    <div className={`flex items-end justify-end gap-2 ${span}`}>
      <Button
        type="primary"
        className="his-filter-button"
        icon={<Search size={14} />}
        onClick={onSearch}
      >
        Search
      </Button>

      <Button className="his-filter-button" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}