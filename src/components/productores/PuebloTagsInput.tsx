import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function parse(csv: string): string[] {
  return csv
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function PuebloTagsInput({
  id,
  value,
  onChange,
  placeholder = "Escribe un pueblo y presiona coma o Enter",
  className = "",
}: Props) {
  const [draft, setDraft] = useState("");
  const tags = parse(value);

  const commit = (next: string[]) => {
    onChange(next.join(", "));
  };

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, "").trim();
    if (!t) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setDraft("");
      return;
    }
    commit([...tags, t]);
    setDraft("");
  };

  const removeTag = (idx: number) => {
    commit(tags.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      e.preventDefault();
      commit(tags.slice(0, -1));
    }
  };

  return (
    <div className={className}>
      {tags.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#54b678]/15 px-2.5 py-1 text-xs font-medium text-[#18253f]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive"
                aria-label={`Quitar ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <Input
        id={id}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(",")) {
            addTag(v);
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        placeholder={placeholder}
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
      />
    </div>
  );
}
