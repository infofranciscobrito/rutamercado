import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  subtext,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#54b678]/15">
        <Icon className="h-6 w-6 text-[#54b678]" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-3xl text-[#18253f] leading-tight">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {subtext && (
          <div className="text-xs text-muted-foreground/80 mt-0.5">{subtext}</div>
        )}
      </div>
    </div>
  );
}

