import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8b625]/15">
        <Icon className="h-6 w-6 text-[#f8b625]" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-3xl text-[#1c1e37] leading-tight">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
