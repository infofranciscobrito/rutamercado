import { LayoutGrid, Rows3 } from "lucide-react";

export type ViewMode = "category" | "grid";

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("category")}
        aria-pressed={value === "category"}
        aria-label="Vista por categoría"
        className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
          value === "category"
            ? "bg-[#54b678] text-[#1c1e37]"
            : "text-[#6B7280] hover:text-[#1c1e37]"
        }`}
      >
        <Rows3 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label="Vista cuadrícula"
        className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
          value === "grid"
            ? "bg-[#54b678] text-[#1c1e37]"
            : "text-[#6B7280] hover:text-[#1c1e37]"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
