import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronDown } from "lucide-react";
import { listMarketTypes } from "@/lib/producers.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (csv: string) => void;
  placeholder?: string;
};

function parse(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function TipoMercadoMultiSelect({
  id,
  value,
  onChange,
  placeholder = "Selecciona uno o más tipos",
}: Props) {
  const listFn = useServerFn(listMarketTypes);
  const { data: options = [] } = useQuery({
    queryKey: ["market-types"],
    queryFn: () => listFn(),
  });

  const selected = useMemo(() => parse(value), [value]);

  // Combine DB options with any pre-existing values to avoid losing them
  const allOptions = useMemo(() => {
    const set = new Set<string>([...options, ...selected]);
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [options, selected]);

  const toggle = (opt: string) => {
    const set = new Set(selected);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange(Array.from(set).join(", "));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          {...({
            autoComplete: "off",
            "data-lpignore": "true",
            "data-form-type": "other",
          } as Record<string, string>)}
          className={cn(
            "mt-1 w-full justify-between font-normal",
            selected.length === 0 && "text-muted-foreground",
          )}
        >
          <span className="flex flex-wrap items-center gap-1 text-left">
            {selected.length === 0 ? (
              placeholder
            ) : (
              selected.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="border-[#54b678] bg-[#54b678]/10 text-[#54b678]"
                >
                  {s}
                </Badge>
              ))
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        {allOptions.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            No hay tipos disponibles.
          </p>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {allOptions.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => toggle(opt)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        checked
                          ? "border-[#54b678] bg-[#54b678] text-white"
                          : "border-input",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
